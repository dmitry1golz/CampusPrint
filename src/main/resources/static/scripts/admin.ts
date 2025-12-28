import { PrintBooking } from './models/buchung.js';
import { Geraet, ThreeDOptions, LaserOptions, PaperOptions, GeraeteStatus, GeraeteTyp } from './models/geraet.js';
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

    let currentRejectId: string | null = null;
    let editingDeviceId: number | null = null; // ID ist jetzt number!
    
    // Cache für Options, damit beim Editieren keine Arrays verloren gehen
    let currentEditOptionsCache: any = null; 

    // Helper
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
        groupZ: getDiv('group-dim-z')
    };

    const modal = {
        element: getDiv('reject-modal'),
        reasonInput: getTextArea('reject-reason')
    };

    init();

    function init() {
        setupTabs();
        setupEventListeners();
        renderAll();
        handleTypeChange();
    }

    async function renderAll() {
        const bookings = getAllBookings();
        const equipment = await getAllGeraete();

        renderBookingList('pending', bookings, containers.pending);
        renderBookingList('active', bookings, containers.active);
        renderBookingList('completed', bookings, containers.completed);
        renderEquipmentList(equipment);
        
        updateCounts(bookings, equipment);
        if (window.lucide) window.lucide.createIcons();
    }

    // --- BUCHUNGEN (bleibt weitgehend gleich) ---
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
                // ... (HTML Aufbau Buchungen - hier keine Änderungen nötig) ...
                // Um Platz zu sparen, habe ich den Buchungs-HTML Teil gekürzt, 
                // da er sich nicht geändert hat. Falls du ihn brauchst, sag Bescheid.
                // Er ist identisch zu deiner vorherigen Version.
                
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
                   <div class="card-body"><p class="text-sm">${b.startDate}</p></div>
                   <div class="card-actions">${actionsHtml}</div>
                `;
                container.appendChild(card);
            });
        }
    }

    // --- GERÄTE LISTE (angepasst an neue Typen) ---
    function renderEquipmentList(equipment: Geraet[]) {
        if (!containers.equipment) return;
        containers.equipment.innerHTML = '';

        equipment.forEach(eq => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Status-Toggle Button Logik
            let statusBtn = '';
            if (eq.status === 'Available') {
                statusBtn = `<button class="btn btn-secondary btn-sm action-btn" data-action="maintenance" data-id="${eq.id}">Wartung</button>`;
            } else if (eq.status === 'Maintenance') {
                statusBtn = `<button class="btn btn-primary btn-sm action-btn" data-action="available" data-id="${eq.id}">Aktivieren</button>`;
            } else {
                statusBtn = `<span class="text-muted text-sm">Status: ${eq.status}</span>`;
            }

            // Info String basierend auf Typ
            let infoString = '';
            if (eq.type === 'FDM_Printer' || eq.type === 'SLA_Printer') {
                const opts = eq.print_options as ThreeDOptions;
                infoString = `Bauraum: ${opts.dimensions.x}x${opts.dimensions.y}x${opts.dimensions.z}mm`;
            } else if (eq.type === 'Laser_Cutter' || eq.type === 'CNC_Mill') {
                const opts = eq.print_options as LaserOptions; 
                infoString = `Fläche: ${opts.work_area.x}x${opts.work_area.y}mm`;
            } else if (eq.type === 'Printer') {
                const opts = eq.print_options as PaperOptions;
                infoString = `Formate: ${opts.formats.join(', ')}`;
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

    function handleTypeChange() {
        if (!forms.typeSelect) return;
        const type = forms.typeSelect.value; 
        // WICHTIG: Hier müssen die values im HTML Select mit den englischen Typen übereinstimmen!
        // <option value="FDM_Printer">...
        
        const is3D = (type === 'FDM_Printer' || type === 'SLA_Printer');
        
        if (forms.groupZ) {
            if (is3D) forms.groupZ.classList.remove('hidden');
            else forms.groupZ.classList.add('hidden');
        }
    }

    async function openEditForm(idStr: string) {
        const id = parseInt(idStr); // String ID zu Number konvertieren
        const all = await getAllGeraete();
        const device = all.find(g => g.id === id);
        if (!device) return;
        
        editingDeviceId = id;
        currentEditOptionsCache = device.print_options; 

        if (forms.formTitle) forms.formTitle.textContent = 'Gerät bearbeiten';
        getInput('eq-name').value = device.name;
        
        // Typ setzen (muss im HTML Select exakt so vorhanden sein)
        if (forms.typeSelect) forms.typeSelect.value = device.type;
        
        getTextArea('eq-desc').value = device.description;
        getInput('eq-image').value = device.image || '';

        // Werte in Inputs füllen
        if (device.type === 'FDM_Printer' || device.type === 'SLA_Printer') {
            const opts = device.print_options as ThreeDOptions;
            forms.dimX.value = opts.dimensions.x.toString();
            forms.dimY.value = opts.dimensions.y.toString();
            forms.dimZ.value = opts.dimensions.z.toString();
        } else if (device.type === 'Laser_Cutter' || device.type === 'CNC_Mill') {
            const opts = device.print_options as LaserOptions;
            forms.dimX.value = opts.work_area.x.toString();
            forms.dimY.value = opts.work_area.y.toString();
            forms.dimZ.value = '';
        }

        handleTypeChange();
        forms.add.classList.remove('hidden');
        forms.add.scrollIntoView({ behavior: 'smooth' });
    }

    async function handleSaveEquipment() {
        const name = getInput('eq-name').value;
        const type = forms.typeSelect.value as GeraeteTyp;
        const desc = getTextArea('eq-desc').value;

        if (!name || !desc) {
            alert('Name und Beschreibung fehlen.');
            return;
        }

        const all = await getAllGeraete();
        const existingDevice = editingDeviceId ? all.find(g => g.id === editingDeviceId) : null;
        const existingStatus = existingDevice ? existingDevice.status : 'Available';

        // Basis-Objekt
        const deviceBase = {
            id: editingDeviceId || 0, // 0 für neu (Backend generiert ID)
            name, 
            type, 
            description: desc,
            status: existingStatus,
            image: getInput('eq-image').value,
        };

        let finalDevice: Geraet;

        // Maße auslesen
        const x = Number(forms.dimX.value) || 0;
        const y = Number(forms.dimY.value) || 0;
        const z = Number(forms.dimZ.value) || 0;

        // Objekt je nach Typ zusammenbauen
        if (type === 'FDM_Printer' || type === 'SLA_Printer') {
            const opts: ThreeDOptions = {
                dimensions: { x, y, z },
                available_materials: currentEditOptionsCache?.available_materials || [],
                supported_layer_heights: currentEditOptionsCache?.supported_layer_heights || [0.1, 0.2],
                nozzle_sizes: currentEditOptionsCache?.nozzle_sizes || [0.4]
            };
            finalDevice = { ...deviceBase, type, print_options: opts } as Geraet;
        } 
        else if (type === 'Laser_Cutter' || type === 'CNC_Mill') {
            const opts: LaserOptions = {
                work_area: { x, y },
                presets: currentEditOptionsCache?.presets || []
            };
            // @ts-ignore
            finalDevice = { ...deviceBase, type, print_options: opts } as Geraet;
        } 
        else {
            // Paper
            const opts: PaperOptions = {
                paper_weights: currentEditOptionsCache?.paper_weights || [],
                formats: currentEditOptionsCache?.formats || ['A4', 'A3']
            };
            finalDevice = { ...deviceBase, type: 'Printer', print_options: opts } as Geraet;
        }

        // Senden
        await addGeraet(finalDevice);
        
        editingDeviceId = null;
        currentEditOptionsCache = null;
        forms.add.classList.add('hidden');
        resetInputs();
        renderAll(); // Neu laden
    }

    function setupEventListeners() {
        // Wir machen die ganze Funktion async
        document.addEventListener('click', async (e) => {
            const target = (e.target as HTMLElement).closest('.action-btn') as HTMLElement;
            if (!target) return;
            const { action, id } = target.dataset;

            if(!id) return;
            const numId = parseInt(id); // Für Geraet-Service (number)
            // id bleibt string für Buchung-Service (da Mocks oft strings nutzen)

            // --- Buchungen ---
            if (action === 'confirm') {
                // await funktioniert auch bei void, löst aber das .then() Problem
                await updateBookingStatus(id, 'confirmed');
                renderAll();
            }
            if (action === 'run') {
                await updateBookingStatus(id, 'running');
                renderAll();
            }
            if (action === 'complete') {
                await updateBookingStatus(id, 'completed');
                renderAll();
            }
            
            // --- Geräte ---
            if (action === 'maintenance') {
                await updateGeraetStatus(numId, 'Maintenance');
                renderAll();
            }
            if (action === 'available') {
                await updateGeraetStatus(numId, 'Available');
                renderAll();
            }
            
            if (action === 'edit-device') openEditForm(id); // id als String ok, da openEditForm parst

            if (action === 'delete-device') {
                if(confirm('Gerät wirklich löschen?')) {
                    await deleteGeraet(numId);
                    renderAll();
                }
            }
            
            // Modal Logik
            if (action === 'reject') {
                currentRejectId = id;
                modal.element.classList.remove('hidden');
            }
        });

        // ... Rest der Listener (btn-show-add, btn-save etc.) bleibt gleich ...
        document.getElementById('btn-show-add-equipment')?.addEventListener('click', () => {
            editingDeviceId = null;
            currentEditOptionsCache = null;
            if (forms.formTitle) forms.formTitle.textContent = 'Neues Gerät';
            resetInputs();
            forms.add.classList.remove('hidden');
        });

        document.getElementById('btn-cancel-equipment')?.addEventListener('click', () => {
            forms.add.classList.add('hidden');
            currentEditOptionsCache = null;
        });
        document.getElementById('btn-save-equipment')?.addEventListener('click', handleSaveEquipment);
        forms.typeSelect.addEventListener('change', handleTypeChange);

        document.getElementById('btn-cancel-reject')?.addEventListener('click', () => modal.element.classList.add('hidden'));
        
        // Auch hier async machen
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
    // Anzeige-Übersetzer
    function translateStatus(s: string) {
        if (s === 'Available') return 'Verfügbar';
        if (s === 'Maintenance') return 'Wartung';
        if (s === 'Defect') return 'Defekt';
        if (s === 'InUse') return 'Besetzt';
        return s;
    }

    function updateCounts(b: PrintBooking[], e: Geraet[]) {
        // ... (unverändert) ...
    }

    function setupTabs() {
        // ... (unverändert) ...
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
    }
});