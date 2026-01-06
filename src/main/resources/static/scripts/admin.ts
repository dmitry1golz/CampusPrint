import { PrintBooking } from './models/booking.js';
import { Device, ThreeDOptions, LaserOptions, PaperOptions, DeviceStatus, DeviceTyp, MaterialProfile } from './models/device.js';
import { getAllBookings, updateBookingStatus } from './services/bookingService.js';
import { getAllDevices, addDevice, deleteDevice, updateDeviceStatus } from './services/deviceService.js';
import { requireAuth } from './services/authService.js';

declare global { interface Window { lucide: { createIcons: () => void; }; } }

requireAuth();

document.addEventListener('DOMContentLoaded', () => {

    // --- STATE ---
    let editingDeviceId: number | null = null;
    let currentRejectId: string | null = null;
    
    // Temporäre Speicher für die Listen
    let tempMaterials: MaterialProfile[] = [];
    let tempLaserPresets: { material: string; thickness: number; power: number; speed: number }[] = [];
    let tempPaperFormats: string[] = [];

    // --- DOM HELPER ---
    const getIn = (id: string) => document.getElementById(id) as HTMLInputElement;
    const getSel = (id: string) => document.getElementById(id) as HTMLSelectElement;
    const getArea = (id: string) => document.getElementById(id) as HTMLTextAreaElement;
    const getDiv = (id: string) => document.getElementById(id) as HTMLDivElement;

    const containers = {
        equipment: getDiv('equipment-list'),
        pending: getDiv('pending-list'),
        active: getDiv('active-list'),
        completed: getDiv('completed-list')
    };

    const forms = {
        add: getDiv('add-equipment-form'),
        title: document.querySelector('#add-equipment-form h3') as HTMLHeadingElement,
        type: getSel('eq-type'),
        dimX: getIn('eq-dim-x'), dimY: getIn('eq-dim-y'), dimZ: getIn('eq-dim-z'),
        
        // Gruppen
        groupZ: getDiv('group-dim-z'),
        groupMaterials: getDiv('group-materials'),
        groupLaser: getDiv('group-laser-presets'),
        groupPaper: getDiv('group-paper-config'),

        // Listen-Container
        listMat: getDiv('material-list'),
        listLas: getDiv('laser-list'),
        listPap: getDiv('paper-list')
    };

    // Inputs für Hinzufügen
    const inpMat = { name: getIn('mat-name'), nozzle: getIn('mat-nozzle'), bed: getIn('mat-bed'), color: getIn('mat-color'), btn: document.getElementById('btn-add-material') };
    const inpLas = { mat: getIn('las-mat'), thick: getIn('las-thick'), power: getIn('las-power'), speed: getIn('las-speed'), btn: document.getElementById('btn-add-laser') };
    const inpPap = { fmt: getIn('pap-format'), btn: document.getElementById('btn-add-paper') };

    // Modal
    const modal = {
        element: getDiv('reject-modal'),
        reasonInput: getArea('reject-reason'),
        btnConfirm: document.getElementById('btn-confirm-reject'),
        btnCancel: document.getElementById('btn-cancel-reject')
    };

    init();

    function init() {
        setupTabs();
        setupEventListeners();
        renderAll();
        handleTypeChange();
    }

    async function renderAll() {
        try {
            const bookings = getAllBookings();
            const equipment = await getAllDevices();
            
            renderBookingList('pending', bookings, containers.pending);
            renderBookingList('active', bookings, containers.active);
            renderBookingList('completed', bookings, containers.completed);
            
            renderEquipmentList(equipment);
            
            updateCounts(bookings, equipment);
            
            if (window.lucide) window.lucide.createIcons();
        } catch(e) { 
            console.error("Fehler beim Laden:", e); 
        }
    }

    // --- RENDER LISTEN HELPER ---

    function renderMaterialList() {
        forms.listMat.innerHTML = '';
        const isSLA = forms.type.value === 'SLA_Printer';
        
        if (tempMaterials.length === 0) {
            forms.listMat.innerHTML = '<div class="text-muted text-sm text-center">Keine Materialien.</div>';
            return;
        }

        tempMaterials.forEach((m, i) => {
            const tempInfo = isSLA ? '' : `<span class="text-muted">(${m.temp_nozzle}°C / ${m.temp_bed}°C)</span>`;
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <div style="width:12px; height:12px; background:${m.color_hex}; border-radius:50%; border:1px solid #ccc;"></div>
                    <strong>${m.name}</strong> ${tempInfo}
                </div>
                <button class="btn-del text-danger" style="background:none; border:none; cursor:pointer;" data-idx="${i}" data-type="mat">✕</button>
            `;
            forms.listMat.appendChild(row);
        });
    }

    function renderLaserList() {
        forms.listLas.innerHTML = '';
        if (tempLaserPresets.length === 0) {
            forms.listLas.innerHTML = '<div class="text-muted text-sm text-center">Keine Presets.</div>';
            return;
        }
        tempLaserPresets.forEach((p, i) => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <div><strong>${p.material}</strong> (${p.thickness}mm) - P:${p.power}% S:${p.speed}%</div>
                <button class="btn-del text-danger" style="background:none; border:none; cursor:pointer;" data-idx="${i}" data-type="las">✕</button>
            `;
            forms.listLas.appendChild(row);
        });
    }

    function renderPaperList() {
        forms.listPap.innerHTML = '';
        if (tempPaperFormats.length === 0) {
            forms.listPap.innerHTML = '<div class="text-muted text-sm text-center">Keine Formate.</div>';
            return;
        }
        tempPaperFormats.forEach((f, i) => {
            const row = document.createElement('div');
            row.className = 'item-row';
            row.innerHTML = `
                <strong>${f}</strong>
                <button class="btn-del text-danger" style="background:none; border:none; cursor:pointer;" data-idx="${i}" data-type="pap">✕</button>
            `;
            forms.listPap.appendChild(row);
        });
    }

    // Globale Delete Listener für alle Listen
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('btn-del')) {
            const idx = parseInt(target.dataset.idx || '0');
            const type = target.dataset.type;
            if (type === 'mat') { tempMaterials.splice(idx, 1); renderMaterialList(); }
            if (type === 'las') { tempLaserPresets.splice(idx, 1); renderLaserList(); }
            if (type === 'pap') { tempPaperFormats.splice(idx, 1); renderPaperList(); }
        }
    });

    // --- FORM LOGIC ---

    function handleTypeChange() {
        if(!forms.type) return;
        const t = forms.type.value;
        const isFDM = t === 'FDM_Printer';
        const isSLA = t === 'SLA_Printer';
        const isLaser = t === 'Laser_Cutter' || t === 'CNC_Mill';
        const isPaper = t === 'Printer';

        // Sichtbarkeit der Hauptgruppen
        if(forms.groupZ) forms.groupZ.classList.toggle('hidden', !isFDM && !isSLA);
        if(forms.groupMaterials) forms.groupMaterials.classList.toggle('hidden', !isFDM && !isSLA);
        if(forms.groupLaser) forms.groupLaser.classList.toggle('hidden', !isLaser);
        if(forms.groupPaper) forms.groupPaper.classList.toggle('hidden', !isPaper);

        // Spezial: Temperatur-Inputs bei SLA ausblenden
        document.querySelectorAll('.temp-input').forEach(el => {
            (el as HTMLElement).style.display = isSLA ? 'none' : 'block';
        });
        
        // Überschriften anpassen
        const matHeader = forms.groupMaterials?.querySelector('h4');
        if(matHeader) matHeader.textContent = isSLA ? 'Harze (Resins)' : 'Materialien (Filamente)';
        
        // Listen neu zeichnen (um UI Glitches zu vermeiden)
        if(isFDM || isSLA) renderMaterialList();
        if(isLaser) renderLaserList();
        if(isPaper) renderPaperList();
    }

    async function handleSave() {
        const name = getIn('eq-name').value;
        const type = forms.type.value as DeviceTyp;
        const desc = getArea('eq-desc').value;
        
        if (!name || !desc) { alert('Name & Beschreibung fehlen.'); return; }

        const all = await getAllDevices();
        const old = editingDeviceId ? all.find(g => g.id === editingDeviceId) : null;
        const oldStatus = old ? old.status : 'Available';
        const oldModel = old && old.model ? old.model : '';

        const base = {
            id: editingDeviceId || 0,
            name, type, description: desc, status: oldStatus, 
            image: getIn('eq-image').value, model: oldModel
        };

        const x = Number(forms.dimX.value)||0; 
        const y = Number(forms.dimY.value)||0; 
        const z = Number(forms.dimZ.value)||0;
        let final: Device;

        if (type === 'FDM_Printer') {
            const opts: ThreeDOptions = {
                tech_type: 'FDM',
                dimensions: {x,y,z},
                available_materials: tempMaterials, 
                supported_layer_heights: [0.1, 0.2],
                nozzle_sizes: [0.4]
            };
            final = { ...base, type, print_options: opts } as Device;
        } else if (type === 'SLA_Printer') {
            const opts: ThreeDOptions = {
                tech_type: 'SLA',
                dimensions: {x,y,z},
                available_materials: tempMaterials, 
                supported_layer_heights: [0.05]
            };
            final = { ...base, type, print_options: opts } as Device;
        } else if (type === 'Laser_Cutter' || type === 'CNC_Mill') {
            const opts: LaserOptions = {
                tech_type: 'LASER',
                work_area: {x,y},
                presets: tempLaserPresets
            };
            // @ts-ignore
            final = { ...base, type, print_options: opts } as Device;
        } else {
            const opts: PaperOptions = {
                tech_type: 'PAPER',
                paper_weights: [80], 
                formats: tempPaperFormats
            };
            final = { ...base, type: 'Printer', print_options: opts } as Device;
        }

        await addDevice(final);
        closeForm();
        renderAll();
    }

    async function openEdit(idStr: string) {
        const id = parseInt(idStr);
        const all = await getAllDevices();
        const dev = all.find(g => g.id === id);
        if(!dev) return;

        editingDeviceId = id;
        forms.title.textContent = 'Gerät bearbeiten';
        
        // Basisdaten
        getIn('eq-name').value = dev.name;
        forms.type.value = dev.type;
        getArea('eq-desc').value = dev.description;
        getIn('eq-image').value = dev.image;

        // Reset Listen
        tempMaterials = [];
        tempLaserPresets = [];
        tempPaperFormats = [];

        // Optionen laden
        if (dev.print_options) {
            const opts = dev.print_options;
            
            // Dimensionen laden
            if('dimensions' in opts) {
                forms.dimX.value = opts.dimensions.x.toString();
                forms.dimY.value = opts.dimensions.y.toString();
                forms.dimZ.value = opts.dimensions.z.toString();
            } else if ('work_area' in opts) {
                forms.dimX.value = opts.work_area.x.toString();
                forms.dimY.value = opts.work_area.y.toString();
                forms.dimZ.value = '';
            }

            // Spezifische Listen laden
            if (dev.type === 'FDM_Printer' || dev.type === 'SLA_Printer') {
                const o = opts as ThreeDOptions;
                if(o.available_materials) tempMaterials = [...o.available_materials];
            } else if (dev.type === 'Laser_Cutter' || dev.type === 'CNC_Mill') {
                const o = opts as LaserOptions;
                if(o.presets) tempLaserPresets = [...o.presets];
            } else if (dev.type === 'Printer') {
                const o = opts as PaperOptions;
                if(o.formats) tempPaperFormats = [...o.formats];
            }
        }

        handleTypeChange();
        renderMaterialList();
        renderLaserList();
        renderPaperList();
        
        forms.add.classList.remove('hidden');
        forms.add.scrollIntoView({behavior:'smooth'});
    }

    function closeForm() {
        forms.add.classList.add('hidden');
        editingDeviceId = null;
        getIn('eq-name').value = '';
        getArea('eq-desc').value = '';
        getIn('eq-image').value = '';
        forms.dimX.value=''; forms.dimY.value=''; forms.dimZ.value='';
    }

    // --- EVENT LISTENERS ---
    function setupEventListeners() {
        // Global Actions
        document.addEventListener('click', async (e) => {
            const btn = (e.target as HTMLElement).closest('.action-btn') as HTMLElement;
            if (!btn) return;
            const { action, id } = btn.dataset;
            if(!id) return;
            const numId = parseInt(id);

            if (action === 'edit-device') openEdit(id);
            if (action === 'delete-device') if(confirm('Löschen?')) { await deleteDevice(numId); renderAll(); }
            if (action === 'set-unavailable') { await updateDeviceStatus(numId, 'Unavailable'); renderAll(); }
            if (action === 'set-available') { await updateDeviceStatus(numId, 'Available'); renderAll(); }
            
            // Buchungs Actions
            if (action === 'confirm') { await updateBookingStatus(id, 'confirmed'); renderAll(); }
            if (action === 'run') { await updateBookingStatus(id, 'running'); renderAll(); }
            if (action === 'complete') { await updateBookingStatus(id, 'completed'); renderAll(); }
            if (action === 'reject') { 
                currentRejectId = id; 
                if(modal.element) modal.element.classList.remove('hidden'); 
            }
        });

        // Add Material (FDM/SLA)
        inpMat.btn?.addEventListener('click', () => {
            if(inpMat.name.value) {
                tempMaterials.push({
                    name: inpMat.name.value,
                    temp_nozzle: Number(inpMat.nozzle.value)||0,
                    temp_bed: Number(inpMat.bed.value)||0,
                    color_hex: inpMat.color.value
                });
                renderMaterialList();
                inpMat.name.value=''; inpMat.nozzle.value=''; inpMat.bed.value='';
            }
        });

        // Add Laser Preset
        inpLas.btn?.addEventListener('click', () => {
            if(inpLas.mat.value) {
                tempLaserPresets.push({
                    material: inpLas.mat.value,
                    thickness: Number(inpLas.thick.value)||0,
                    power: Number(inpLas.power.value)||0,
                    speed: Number(inpLas.speed.value)||0
                });
                renderLaserList();
                inpLas.mat.value=''; inpLas.thick.value='';
            }
        });

        // Add Paper Format
        inpPap.btn?.addEventListener('click', () => {
            if(inpPap.fmt.value) {
                tempPaperFormats.push(inpPap.fmt.value);
                renderPaperList();
                inpPap.fmt.value = '';
            }
        });

        // Save / Cancel / Show Add
        document.getElementById('btn-save-equipment')?.addEventListener('click', handleSave);
        document.getElementById('btn-cancel-equipment')?.addEventListener('click', closeForm);
        forms.type?.addEventListener('change', handleTypeChange);
        
        document.getElementById('btn-show-add-equipment')?.addEventListener('click', () => {
            closeForm(); // Reset
            forms.title.textContent = 'Neues Gerät';
            tempMaterials=[]; tempLaserPresets=[]; tempPaperFormats=[];
            renderMaterialList(); renderLaserList(); renderPaperList();
            forms.add.classList.remove('hidden');
            handleTypeChange();
        });

        // Reject Modal
        modal.btnCancel?.addEventListener('click', () => modal.element.classList.add('hidden'));
        modal.btnConfirm?.addEventListener('click', async () => {
            if (currentRejectId && modal.reasonInput.value) {
                await updateBookingStatus(currentRejectId, 'rejected', modal.reasonInput.value);
                modal.element.classList.add('hidden');
                modal.reasonInput.value = '';
                currentRejectId = null;
                renderAll();
            }
        });
    }

    // --- OTHER HELPERS (WICHTIG: NICHT MEHR LEER LASSEN) ---
    
    function renderEquipmentList(equipment: Device[]) {
        if (!containers.equipment) return;
        containers.equipment.innerHTML = '';
        equipment.forEach(eq => {
            const card = document.createElement('div');
            card.className = 'card';
            const statusBtn = eq.status === 'Available' 
                ? `<button class="btn btn-secondary btn-sm action-btn" data-action="set-unavailable" data-id="${eq.id}">Deaktivieren</button>` 
                : `<button class="btn btn-primary btn-sm action-btn" data-action="set-available" data-id="${eq.id}">Aktivieren</button>`;

            let info = 'Keine Details';
            if (eq.print_options) {
                // Defensive Prüfung, da Backend-Daten theoretisch fehlen könnten
                if((eq.type === 'FDM_Printer') && 'available_materials' in eq.print_options) 
                    info = `${(eq.print_options as ThreeDOptions).available_materials?.length || 0} Filamente`;
                else if((eq.type === 'SLA_Printer') && 'available_materials' in eq.print_options) 
                    info = `${(eq.print_options as ThreeDOptions).available_materials?.length || 0} Harze`;
                else if((eq.type === 'Laser_Cutter') && 'presets' in eq.print_options) 
                    info = `${(eq.print_options as LaserOptions).presets?.length || 0} Presets`;
                else if((eq.type === 'Printer') && 'formats' in eq.print_options) 
                    info = `${(eq.print_options as PaperOptions).formats?.join(', ')}`;
            }

            card.innerHTML = `
                <div class="card-header"><h3 class="card-title">${eq.name}</h3><span class="badge ${eq.status==='Available'?'confirmed':'pending'}">${eq.status === 'Available' ? 'Verfügbar' : 'Nicht Verfügbar'}</span></div>
                <div class="card-body">
                    ${eq.image ? `<img src="${eq.image}" style="width:100%; height:100px; object-fit:cover; margin-bottom:8px;">` : ''}
                    <p>Typ: ${eq.type}</p>
                    <p class="text-muted text-sm">${info}</p>
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
                } else if (b.status === 'confirmed') actionsHtml = `<button class="btn btn-primary action-btn w-full" data-action="run" data-id="${b.id}">Starten</button>`;
                else if (b.status === 'running') actionsHtml = `<button class="btn btn-primary action-btn w-full" data-action="complete" data-id="${b.id}">Abschließen</button>`;

                card.innerHTML = `
                   <div class="card-header"><h3 class="card-title">${b.printerName}</h3><span class="badge ${b.status}">${b.status}</span></div>
                   <div class="card-body"><p class="text-sm">${b.startDate.toLocaleDateString()}</p></div>
                   <div class="card-actions">${actionsHtml}</div>
                `;
                container.appendChild(card);
            });
        }
    }

    function updateCounts(b: PrintBooking[], e: Device[]) {
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
});