import { PrintBooking } from './models/buchung.js';
import { Geraet, ThreeDOptions, LaserOptions, PaperOptions } from './models/geraet.js';
import { getAllBookings, updateBookingStatus } from './services/buchung-service.js';
import { getAllGeraete, addGeraet, deleteGeraet, updateGeraetStatus } from './services/geraet-service.js';
import { requireAuth } from './services/auth-service.js';

// Extend window interface for lucide icons
declare global {
    interface Window {
        lucide: {
            createIcons: () => void;
        };
    }
}

requireAuth();

document.addEventListener('DOMContentLoaded', () => {

    let currentRejectId: string | null = null;
    let editingDeviceId: string | null = null;
    
    // temp storage for print_options to keep array data (materials/presets) during edit
    // using 'any' here as a temporary buffer for the complex nested structures
    let currentEditOptionsCache: any = null; 

    // DOM helper with type casting
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
                        <button class="btn btn-primary action-btn" data-action="confirm" data-id="${b.id}" title="Approve"><i data-lucide="check"></i></button>
                        <button class="btn btn-danger action-btn" data-action="reject" data-id="${b.id}" title="Reject"><i data-lucide="x"></i></button>
                    `;
                } else if (b.status === 'confirmed') {
                    actionsHtml = `<button class="btn btn-primary action-btn w-full" data-action="run" data-id="${b.id}">Start Print</button>`;
                } else if (b.status === 'running') {
                    actionsHtml = `<button class="btn btn-primary action-btn w-full" data-action="complete" data-id="${b.id}">Finish Print</button>`;
                }

                card.innerHTML = `
                    <div class="card-header">
                        <h3 class="card-title">${b.printerName}</h3>
                        <span class="badge ${b.status}">${translateStatus(b.status)}</span>
                    </div>
                    <div class="card-body">
                        <p class="text-sm"><strong>Time:</strong> ${b.startDate} - ${b.endDate}</p>
                        ${b.notes ? `<p class="text-sm text-muted"><strong>Note:</strong> ${b.notes}</p>` : ''}
                        ${b.message ? `<p class="text-sm" style="color:var(--danger)"><strong>Reason:</strong> ${b.message}</p>` : ''}
                    </div>
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
            
            // toggle status button
            const statusBtn = eq.status === 'Verfügbar' 
                ? `<button class="btn btn-secondary btn-sm action-btn" data-action="maintenance" data-id="${eq.id}">Maintenance</button>`
                : `<button class="btn btn-primary btn-sm action-btn" data-action="available" data-id="${eq.id}">Activate</button>`;

            // build info string based on device type
            let infoString = '';
            
            if (eq.type === 'FDM_Drucker' || eq.type === 'SLA_Drucker') {
                const opts = eq.print_options as ThreeDOptions;
                infoString = `Volume: ${opts.dimensions.x}x${opts.dimensions.y}x${opts.dimensions.z}mm`;
            } 
            else if (eq.type === 'Lasercutter') {
                const opts = eq.print_options as LaserOptions; 
                infoString = `Work Area: ${opts.work_area.x}x${opts.work_area.y}mm`;
            } 
            else if (eq.type === 'Papierdrucker') {
                const opts = eq.print_options as PaperOptions;
                infoString = `Formats: ${opts.formats.join(', ')}`;
            }

            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${eq.name}</h3>
                    <span class="badge ${eq.status === 'Verfügbar' ? 'confirmed' : 'pending'}">${eq.status}</span>
                </div>
                <div class="card-body">
                    ${eq.image ? `<img src="${eq.image}" class="mb-2" style="width:100%; height:120px; object-fit:cover; border-radius:4px;">` : ''}
                    <p class="text-muted text-sm mb-1">${eq.description}</p>
                    <p class="text-sm"><strong>Type:</strong> ${eq.type}</p>
                    ${infoString ? `<p class="text-sm text-muted">${infoString}</p>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm action-btn" data-action="edit-device" data-id="${eq.id}" title="Edit">Edit</button>
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
        const is3D = (type === 'FDM_Drucker' || type === 'SLA_Drucker');
        
        if (forms.groupZ) {
            // Z-Axis only relevant for 3D printers
            if (is3D) forms.groupZ.classList.remove('hidden');
            else forms.groupZ.classList.add('hidden');
        }
    }

    async function openEditForm(id: string) {
        const all = await getAllGeraete();
        const device = all.find(g => g.id === id);
        if (!device) return;
        
        editingDeviceId = id;
        currentEditOptionsCache = device.print_options; 

        if (forms.formTitle) forms.formTitle.textContent = 'Edit Device';
        getInput('eq-name').value = device.name;
        if (forms.typeSelect) forms.typeSelect.value = device.type;
        getTextArea('eq-desc').value = device.description;
        getInput('eq-image').value = device.image || '';

        // pre-fill inputs based on specific type
        if (device.type === 'FDM_Drucker' || device.type === 'SLA_Drucker') {
            const opts = device.print_options as ThreeDOptions;
            forms.dimX.value = opts.dimensions.x.toString();
            forms.dimY.value = opts.dimensions.y.toString();
            forms.dimZ.value = opts.dimensions.z.toString();
        } else if (device.type === 'Lasercutter') {
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
        const type = forms.typeSelect.value as Geraet['type'];
        const desc = getTextArea('eq-desc').value;

        if (!name || !desc) {
            alert('Name and description are required.');
            return;
        }

        // fetch existing status if editing
        const all = await getAllGeraete();
        const existingStatus = editingDeviceId ? all.find(g => g.id === editingDeviceId)?.status : 'Verfügbar';

        // basic object construction
        const deviceBase = {
            id: editingDeviceId || Date.now().toString(),
            name, 
            type, 
            description: desc,
            status: existingStatus || 'Verfügbar',
            image: getInput('eq-image').value,
        };

        let finalDevice: Geraet;

        // gather dimensions
        const x = Number(forms.dimX.value) || 0;
        const y = Number(forms.dimY.value) || 0;
        const z = Number(forms.dimZ.value) || 0;

        // construct full object matching the interface
        if (type === 'FDM_Drucker' || type === 'SLA_Drucker') {
            const opts: ThreeDOptions = {
                dimensions: { x, y, z },
                // retain cached arrays if available, else use defaults
                available_materials: currentEditOptionsCache?.available_materials || [],
                supported_layer_heights: currentEditOptionsCache?.supported_layer_heights || [0.1, 0.2],
                nozzle_sizes: currentEditOptionsCache?.nozzle_sizes || [0.4]
            };
            finalDevice = { ...deviceBase, type, print_options: opts } as Geraet;
        } 
        else if (type === 'Lasercutter') {
            const opts: LaserOptions = {
                work_area: { x, y },
                presets: currentEditOptionsCache?.presets || []
            };
            finalDevice = { ...deviceBase, type, print_options: opts } as Geraet;
        } 
        else {
            // Paper printer
            const opts: PaperOptions = {
                paper_weights: currentEditOptionsCache?.paper_weights || [],
                formats: currentEditOptionsCache?.formats || ['A4', 'A3']
            };
            finalDevice = { ...deviceBase, type, print_options: opts } as Geraet;
        }

        if (editingDeviceId) {
            await deleteGeraet(editingDeviceId);
            await addGeraet(finalDevice);
            editingDeviceId = null;
        } else {
            await addGeraet(finalDevice);
        }
        
        currentEditOptionsCache = null;
        renderAll();
        forms.add.classList.add('hidden');
        resetInputs();
    }

    function setupEventListeners() {
        document.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('.action-btn') as HTMLElement;
            if (!target) return;
            const { action, id } = target.dataset;

            if (action === 'confirm' && id) updateBookingStatus(id, 'confirmed');
            if (action === 'run' && id) updateBookingStatus(id, 'running');
            if (action === 'complete' && id) updateBookingStatus(id, 'completed');
            if (action === 'reject' && id) {
                currentRejectId = id;
                modal.element.classList.remove('hidden');
            }
            if (action === 'maintenance' && id) updateGeraetStatus(id, 'Wartung').then(renderAll);
            if (action === 'available' && id) updateGeraetStatus(id, 'Verfügbar').then(renderAll);
            if (action === 'edit-device' && id) openEditForm(id);
            if (action === 'delete-device' && id) {
                if(confirm('Really delete this device?')) deleteGeraet(id).then(renderAll);
            }
            // trigger re-render for sync actions
            if (['confirm', 'run', 'complete'].includes(action || '')) renderAll();
        });

        document.getElementById('btn-show-add-equipment')?.addEventListener('click', () => {
            editingDeviceId = null;
            currentEditOptionsCache = null;
            if (forms.formTitle) forms.formTitle.textContent = 'Configure New Device';
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
        document.getElementById('btn-confirm-reject')?.addEventListener('click', () => {
            if (currentRejectId && modal.reasonInput.value) {
                updateBookingStatus(currentRejectId, 'rejected', modal.reasonInput.value);
                modal.element.classList.add('hidden');
                modal.reasonInput.value = '';
                currentRejectId = null;
                renderAll();
            }
        });
    }

    // map status codes to readable UI labels
    function translateStatus(s: string) {
        const map: {[key: string]: string} = { 'pending': 'Pending', 'confirmed': 'Confirmed', 'running': 'In Progress', 'completed': 'Done', 'rejected': 'Rejected' };
        return map[s] || s;
    }

    function updateCounts(b: PrintBooking[], e: Geraet[]) {
        const setTxt = (id: string, txt: string) => {
            const el = document.getElementById(id);
            if(el) el.textContent = txt;
        };
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
    }
});