import { PrintBooking } from './models/buchung.js';
import { Geraet, ThreeDOptions, LaserOptions, PaperOptions, GeraeteStatus, GeraeteTyp, MaterialProfile } from './models/geraet.js';
import { getAllBookings, updateBookingStatus } from './services/buchung-service.js';
import { getAllGeraete, addGeraet, deleteGeraet, updateGeraetStatus } from './services/geraet-service.js';
import { requireAuth } from './services/auth-service.js';

declare global {
    interface Window {
        lucide: { createIcons: () => void; };
    }
}

requireAuth();

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let currentRejectId: string | null = null;
    let editingDeviceId: number | null = null;
    
    // Temporäre Liste für Materialien (nur während des Editierens aktiv)
    let tempMaterialList: MaterialProfile[] = [];
    
    // Cache für Optionen anderer Gerätetypen, damit nichts verloren geht beim Umschalten
    let currentEditOptionsCache: any = null; 

    // --- DOM ELEMENTE ---
    const getInput = (id: string) => document.getElementById(id) as HTMLInputElement;
    const getSelect = (id: string) => document.getElementById(id) as HTMLSelectElement;
    const getTextArea = (id: string) => document.getElementById(id) as HTMLTextAreaElement;
    const getDiv = (id: string) => document.getElementById(id) as HTMLDivElement;

    const containers = {
        pending: getDiv('pending-list'),
        active: getDiv('active-list'),
        completed: getDiv('completed-list'),
        equipment: getDiv('equipment-list')
    };

    const forms = {
        add: getDiv('add-equipment-form'),
        formTitle: document.querySelector('#add-equipment-form h3') as HTMLHeadingElement,
        typeSelect: getSelect('eq-type'),
        dimX: getInput('eq-dim-x'),
        dimY: getInput('eq-dim-y'),
        dimZ: getInput('eq-dim-z'),
        groupZ: getDiv('group-dim-z'),
        groupMaterials: getDiv('group-materials'),      // Container für Material-Manager
        materialListContainer: getDiv('material-list')  // Liste der Materialien
    };

    // Inputs für NEUES Material
    const matInputs = {
        name: getInput('mat-name'),
        nozzle: getInput('mat-nozzle'),
        bed: getInput('mat-bed'),
        color: getInput('mat-color'),
        addBtn: document.getElementById('btn-add-material')
    };

    const modal = {
        element: getDiv('reject-modal'),
        reasonInput: getTextArea('reject-reason')
    };

    // --- INIT ---
    init();

    function init() {
        setupTabs();
        setupEventListeners();
        renderAll();
        handleTypeChange(); // Initiale Sichtbarkeit setzen
    }

    async function renderAll() {
        try {
            const bookings = getAllBookings();
            const equipment = await getAllGeraete();

            renderBookingList('pending', bookings, containers.pending);
            renderBookingList('active', bookings, containers.active);
            renderBookingList('completed', bookings, containers.completed);
            
            renderEquipmentList(equipment);
            
            updateCounts(bookings, equipment);
            if (window.lucide) window.lucide.createIcons();
        } catch (e) {
            console.error("Critical error in renderAll:", e);
        }
    }

    // --- RENDER FUNCTIONS ---

    function renderBookingList(viewType: string, allBookings: PrintBooking[], container: HTMLDivElement) {
        if (!container) return;
        container.innerHTML = '';
        
        let filtered: PrintBooking[] = [];
        if (viewType === 'pending') filtered = allBookings.filter(b => b.status === 'pending');
        else if (viewType === 'active') filtered = allBookings.filter(b => ['confirmed', 'running'].includes(b.status));
        else if (viewType === 'completed') filtered = allBookings.filter(b => ['completed', 'rejected'].includes(b.status));

        const emptyMsg = document.getElementById(`${viewType}-empty`);
        if (filtered.length === 0) {
            emptyMsg?.classList.remove('hidden');
        } else {
            emptyMsg?.classList.add('hidden');
            filtered.forEach(b => {
                const card = document.createElement('div');
                card.className = 'card';
                
                let actionsHtml = '';
                if (b.status === 'pending') {
                    actionsHtml = `
                        <button class="btn btn-primary action-btn" data-action="confirm" data-id="${b.id}"><i data-lucide="check"></i></button>
                        <button class="btn btn-danger action-btn" data-action="reject" data-id="${b.id}"><i data-lucide="x"></i></button>
                    `;
                } else if (b.status === 'confirmed') {
                    actionsHtml = `<button class="btn btn-primary action-btn w-full" data-action="run" data-id="${b.id}">Starten</button>`;
                } else if (b.status === 'running') {
                    actionsHtml = `<button class="btn btn-primary action-btn w-full" data-action="complete" data-id="${b.id}">Abschließen</button>`;
                }

                card.innerHTML = `
                   <div class="card-header"><h3 class="card-title">${b.printerName}</h3><span class="badge ${b.status}">${b.status}</span></div>
                   <div class="card-body"><p class="text-sm">${b.startDate.toLocaleDateString()} ${b.startDate.getHours()}:${b.startDate.getMinutes()}</p></div>
                   <div class="card-actions">${actionsHtml}</div>
                `;
                container.appendChild(card);
            });
        }
    }

    function renderEquipmentList(equipment: Geraet[]) {
        if (!containers.equipment) return;
        containers.equipment.innerHTML = '';

        equipment.forEach(eq => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Status Toggle (Vereinfacht)
            let statusBtn = '';
            if (eq.status === 'Available') {
                statusBtn = `<button class="btn btn-secondary btn-sm action-btn" data-action="set-unavailable" data-id="${eq.id}">Deaktivieren</button>`;
            } else {
                statusBtn = `<button class="btn btn-primary btn-sm action-btn" data-action="set-available" data-id="${eq.id}">Aktivieren</button>`;
            }

            // Info String (Sicherheitsgeprüft)
            let infoString = 'Keine Details';
            
            if (eq.print_options) {
                if (eq.type === 'FDM_Printer') {
                    const opts = eq.print_options as ThreeDOptions;
                    const matCount = opts.available_materials ? opts.available_materials.length : 0;
                    infoString = `Bauraum: ${opts.dimensions?.x}x${opts.dimensions?.y}x${opts.dimensions?.z}mm | ${matCount} Filamente`;
                } else if (eq.type === 'SLA_Printer') {
                    const opts = eq.print_options as ThreeDOptions;
                    infoString = `Bauraum: ${opts.dimensions?.x}x${opts.dimensions?.y}x${opts.dimensions?.z}mm`;
                } else if (eq.type === 'Laser_Cutter' || eq.type === 'CNC_Mill') {
                    const opts = eq.print_options as LaserOptions;
                    infoString = `Fläche: ${opts.work_area?.x}x${opts.work_area?.y}mm`;
                } else if (eq.type === 'Printer') {
                    const opts = eq.print_options as PaperOptions;
                    if (opts.formats) infoString = `Formate: ${opts.formats.join(', ')}`;
                }
            }

            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${eq.name}</h3>
                    <span class="badge ${eq.status === 'Available' ? 'confirmed' : 'pending'}">${translateStatus(eq.status)}</span>
                </div>
                <div class="card-body">
                    ${eq.image ? `<img src="${eq.image}" style="width:100%; height:100px; object-fit:cover; margin-bottom:8px;">` : ''}
                    <p class="text-sm"><strong>Typ:</strong> ${eq.type}</p>
                    <p class="text-sm text-muted">${infoString}</p>
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm action-btn" data-action="edit-device" data-id="${eq.id}">Edit</button>
                    ${statusBtn}
                    <button class="btn btn-danger btn-sm action-btn" data-action="delete-device" data-id="${eq.id}"><i data-lucide="trash-2"></i></button>
                </div>
            `;
            containers.equipment.appendChild(card);
        });
    }

    function renderMaterialList() {
        if (!forms.materialListContainer) return;
        forms.materialListContainer.innerHTML = '';
        
        if (tempMaterialList.length === 0) {
            forms.materialListContainer.innerHTML = '<div class="text-muted text-sm text-center">Keine Materialien definiert.</div>';
            return;
        }

        tempMaterialList.forEach((mat, index) => {
            const row = document.createElement('div');
            // Inline Styles für schnelle UI Anpassung
            row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:4px 8px; border-bottom:1px solid #eee; font-size:0.9rem;';

            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:12px; height:12px; border-radius:50%; background-color:${mat.color_hex}; border:1px solid #ccc;"></div>
                    <strong>${mat.name}</strong> 
                    <span class="text-muted">(${mat.temp_nozzle}°C / ${mat.temp_bed}°C)</span>
                </div>
                <button type="button" class="btn-delete-mat text-danger" style="background:none; border:none; cursor:pointer; font-weight:bold;" data-index="${index}">
                    ✕
                </button>
            `;
            forms.materialListContainer.appendChild(row);
        });

        // Delete Listener für die kleinen X Buttons
        document.querySelectorAll('.btn-delete-mat').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
                tempMaterialList.splice(idx, 1); // Aus Array löschen
                renderMaterialList(); // Neu zeichnen
            });
        });
    }

    // --- FORM LOGIC ---

    function handleTypeChange() {
        if (!forms.typeSelect) return;
        const type = forms.typeSelect.value; 
        
        const isFDM = type === 'FDM_Printer';
        const is3D = (type === 'FDM_Printer' || type === 'SLA_Printer');
        
        // Z-Achse nur für 3D
        if (forms.groupZ) {
            if (is3D) forms.groupZ.classList.remove('hidden');
            else forms.groupZ.classList.add('hidden');
        }

        // Material Manager nur für FDM (da SLA andere Felder hat, die wir hier vereinfacht haben)
        if (forms.groupMaterials) {
            if (isFDM) forms.groupMaterials.classList.remove('hidden');
            else forms.groupMaterials.classList.add('hidden');
        }
    }

    async function openEditForm(idStr: string) {
        const id = parseInt(idStr);
        const all = await getAllGeraete();
        const device = all.find(g => g.id === id);
        if (!device) return;
        
        editingDeviceId = id;
        currentEditOptionsCache = device.print_options || {}; 

        if (forms.formTitle) forms.formTitle.textContent = 'Gerät bearbeiten';
        getInput('eq-name').value = device.name;
        if (forms.typeSelect) forms.typeSelect.value = device.type;
        getTextArea('eq-desc').value = device.description;
        getInput('eq-image').value = device.image || '';

        // Material Liste resetten
        tempMaterialList = [];

        // Werte vorbefüllen
        if (device.print_options) {
            if (device.type === 'FDM_Printer') {
                const opts = device.print_options as ThreeDOptions;
                if(opts.dimensions) {
                    forms.dimX.value = opts.dimensions.x.toString();
                    forms.dimY.value = opts.dimensions.y.toString();
                    forms.dimZ.value = opts.dimensions.z.toString();
                }
                // Materialien laden
                if (opts.available_materials) {
                    tempMaterialList = [...opts.available_materials];
                }
            } 
            else if (device.type === 'SLA_Printer') {
                const opts = device.print_options as ThreeDOptions;
                if(opts.dimensions) {
                    forms.dimX.value = opts.dimensions.x.toString();
                    forms.dimY.value = opts.dimensions.y.toString();
                    forms.dimZ.value = opts.dimensions.z.toString();
                }
            }
            else if (device.type === 'Laser_Cutter' || device.type === 'CNC_Mill') {
                const opts = device.print_options as LaserOptions;
                if(opts.work_area) {
                    forms.dimX.value = opts.work_area.x.toString();
                    forms.dimY.value = opts.work_area.y.toString();
                }
                forms.dimZ.value = '';
            }
        }

        handleTypeChange();
        renderMaterialList(); // UI Update
        
        forms.add.classList.remove('hidden');
        forms.add.scrollIntoView({ behavior: 'smooth' });
    }

    async function handleSaveEquipment() {
        const name = getInput('eq-name').value;
        const type = forms.typeSelect.value as GeraeteTyp;
        const desc = getTextArea('eq-desc').value;

        // 1. Validierung vorab
        if (!name || !desc) {
            alert('Bitte Name und Beschreibung ausfüllen.');
            return;
        }

        // 2. Existierende Daten holen (um Model und Status zu erhalten)
        const all = await getAllGeraete();
        const existingDevice = editingDeviceId ? all.find(g => g.id === editingDeviceId) : null;
        
        const existingStatus = existingDevice ? existingDevice.status : 'Available';
        // WICHTIG: Das Model retten! Wenn es null ist, senden wir einen Leerstring.
        const existingModel = existingDevice && existingDevice.model ? existingDevice.model : '';

        // 3. Basis-Objekt erstellen (nur einmal!)
        const deviceBase = {
            id: editingDeviceId || 0,
            name, 
            type, 
            description: desc, 
            status: existingStatus, 
            image: getInput('eq-image').value,
            model: existingModel // <--- Hier wird das Model an das Backend gesendet
        };

        // 4. Dimensionen auslesen
        const x = Number(forms.dimX.value) || 0;
        const y = Number(forms.dimY.value) || 0;
        const z = Number(forms.dimZ.value) || 0;

        let finalDevice: Geraet;

        // 5. Spezifische Optionen je nach Typ (mit tech_type)
        if (type === 'FDM_Printer') {
            const opts: ThreeDOptions = {
                tech_type: 'FDM',
                dimensions: { x, y, z },
                // Hier nutzen wir die Liste aus dem Material-Manager
                available_materials: tempMaterialList, 
                supported_layer_heights: currentEditOptionsCache?.supported_layer_heights || [0.1, 0.2],
                nozzle_sizes: currentEditOptionsCache?.nozzle_sizes || [0.4]
            };
            finalDevice = { ...deviceBase, type, print_options: opts } as Geraet;
        }
        else if (type === 'SLA_Printer') {
            const opts: ThreeDOptions = {
                tech_type: 'SLA',
                dimensions: { x, y, z },
                available_materials: [], 
                supported_layer_heights: [0.05]
            };
            finalDevice = { ...deviceBase, type, print_options: opts } as Geraet;
        } 
        else if (type === 'Laser_Cutter' || type === 'CNC_Mill') {
            const opts: LaserOptions = {
                tech_type: 'LASER',
                work_area: { x, y },
                presets: currentEditOptionsCache?.presets || []
            };
            // @ts-ignore (wegen Typescript Union Typen manchmal nötig)
            finalDevice = { ...deviceBase, type, print_options: opts } as Geraet;
        } 
        else {
            const opts: PaperOptions = {
                tech_type: 'PAPER',
                paper_weights: currentEditOptionsCache?.paper_weights || [],
                formats: currentEditOptionsCache?.formats || ['A4', 'A3']
            };
            finalDevice = { ...deviceBase, type: 'Printer', print_options: opts } as Geraet;
        }

        // 6. Senden
        await addGeraet(finalDevice);
        
        // 7. Reset und UI Update
        editingDeviceId = null;
        currentEditOptionsCache = null;
        tempMaterialList = [];
        forms.add.classList.add('hidden');
        resetInputs();
        renderAll(); 
    }

    function setupEventListeners() {
        document.addEventListener('click', async (e) => {
            const target = (e.target as HTMLElement).closest('.action-btn') as HTMLElement;
            if (!target) return;
            const { action, id } = target.dataset;

            if(!id) return;
            const numId = parseInt(id);

            // Buchungen Actions
            if (action === 'confirm') { await updateBookingStatus(id, 'confirmed'); renderAll(); }
            if (action === 'run') { await updateBookingStatus(id, 'running'); renderAll(); }
            if (action === 'complete') { await updateBookingStatus(id, 'completed'); renderAll(); }
            if (action === 'reject') { currentRejectId = id; modal.element.classList.remove('hidden'); }
            
            // Geräte Status Toggle
            if (action === 'set-unavailable') { await updateGeraetStatus(numId, 'Unavailable'); renderAll(); }
            if (action === 'set-available') { await updateGeraetStatus(numId, 'Available'); renderAll(); }
            
            // Edit / Delete
            if (action === 'edit-device') openEditForm(id);
            if (action === 'delete-device') {
                if(confirm('Gerät wirklich löschen?')) { await deleteGeraet(numId); renderAll(); }
            }
        });

        // "Material Hinzufügen" Button
        matInputs.addBtn?.addEventListener('click', () => {
            const name = matInputs.name.value;
            const nozzle = parseInt(matInputs.nozzle.value);
            const bed = parseInt(matInputs.bed.value);
            const color = matInputs.color.value;

            if (name && !isNaN(nozzle) && !isNaN(bed)) {
                tempMaterialList.push({
                    name: name,
                    temp_nozzle: nozzle,
                    temp_bed: bed,
                    color_hex: color
                });
                renderMaterialList(); 
                
                // Inputs leeren
                matInputs.name.value = '';
                matInputs.nozzle.value = '';
                matInputs.bed.value = '';
            } else {
                alert("Bitte Name und Temperaturen korrekt angeben.");
            }
        });

        document.getElementById('btn-show-add-equipment')?.addEventListener('click', () => {
            editingDeviceId = null;
            currentEditOptionsCache = null;
            tempMaterialList = [];
            if (forms.formTitle) forms.formTitle.textContent = 'Neues Gerät';
            resetInputs();
            renderMaterialList(); // Leere Liste anzeigen
            forms.add.classList.remove('hidden');
            handleTypeChange();
        });

        document.getElementById('btn-cancel-equipment')?.addEventListener('click', () => {
            forms.add.classList.add('hidden');
            currentEditOptionsCache = null;
            tempMaterialList = [];
        });
        document.getElementById('btn-save-equipment')?.addEventListener('click', handleSaveEquipment);
        forms.typeSelect.addEventListener('change', handleTypeChange);
        
        document.getElementById('btn-cancel-reject')?.addEventListener('click', () => modal.element.classList.add('hidden'));
        document.getElementById('btn-confirm-reject')?.addEventListener('click', async () => {
            if (currentRejectId && modal.reasonInput.value) {
                await updateBookingStatus(currentRejectId, 'rejected', modal.reasonInput.value);
                modal.element.classList.add('hidden');
                modal.reasonInput.value = '';
                currentRejectId = null;
                renderAll();
            }
        });
    }

    function translateStatus(s: string) {
        if (s === 'Available') return 'Verfügbar';
        if (s === 'Unavailable') return 'Nicht Verfügbar';
        return s;
    }

    function updateCounts(b: PrintBooking[], e: Geraet[]) {
        const setTxt = (id: string, txt: string) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
        setTxt('count-pending', `(${b.filter(x => x.status === 'pending').length})`);
        setTxt('count-active', `(${b.filter(x => ['confirmed', 'running'].includes(x.status)).length})`);
        setTxt('count-completed', `(${b.filter(x => ['completed', 'rejected'].includes(x.status)).length})`);
        setTxt('count-equipment', `(${e.length})`);
    }

    function setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.addEventListener('click', () => {
            tabs.forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            t.classList.add('active');
            const target = (t as HTMLElement).dataset.target;
            document.getElementById(`tab-${target}`)?.classList.add('active');
        }));
    }

    function resetInputs() {
        getInput('eq-name').value = '';
        getTextArea('eq-desc').value = '';
        getInput('eq-image').value = '';
        forms.dimX.value = '';
        forms.dimY.value = '';
        forms.dimZ.value = '';
        
        if(forms.materialListContainer) forms.materialListContainer.innerHTML = '';
        matInputs.name.value = '';
        matInputs.nozzle.value = '';
        matInputs.bed.value = '';
    }
});