import { PrintBooking } from './models/buchung.js';
import { Geraet } from './models/geraet.js';
import { getAllBookings, updateBookingStatus } from './services/buchung-service.js';
import { getAllGeraete, addGeraet, deleteGeraet, updateGeraetStatus } from './services/geraet-service.js';
import { requireAuth } from './services/auth-service.js';

requireAuth();

document.addEventListener('DOMContentLoaded', () => {

    let currentRejectId: string | null = null;
    let editingDeviceId: string | null = null;

    const containers = {
        pending: document.getElementById('pending-list') as HTMLDivElement,
        active: document.getElementById('active-list') as HTMLDivElement,
        completed: document.getElementById('completed-list') as HTMLDivElement,
        equipment: document.getElementById('equipment-list') as HTMLDivElement
    };

    const forms = {
        add: document.getElementById('add-equipment-form') as HTMLDivElement,
        formTitle: document.querySelector('#add-equipment-form h3') as HTMLHeadingElement,
        typeSelect: document.getElementById('eq-type') as HTMLSelectElement,
        specific3d: document.getElementById('specific-3d-fields') as HTMLDivElement,
        volumeLabel: document.getElementById('label-volume') as HTMLLabelElement
    };

    const modal = {
        element: document.getElementById('reject-modal') as HTMLDivElement,
        reasonInput: document.getElementById('reject-reason') as HTMLTextAreaElement
    };

    init();

    function init() {
        setupTabs();
        setupEventListeners();
        renderAll();
        handleTypeChange();
    }

    function renderAll() {
        const bookings = getAllBookings();
        const equipment = getAllGeraete();

        renderBookingList('pending', bookings, containers.pending);
        renderBookingList('active', bookings, containers.active);
        renderBookingList('completed', bookings, containers.completed);
        renderEquipmentList(equipment);
        
        updateCounts(bookings, equipment);
        
        // @ts-ignore
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
                        <button class="btn btn-primary action-btn" data-action="confirm" data-id="${b.id}" title="Annehmen"><i data-lucide="check"></i></button>
                        <button class="btn btn-danger action-btn" data-action="reject" data-id="${b.id}" title="Ablehnen"><i data-lucide="x"></i></button>
                    `;
                } else if (b.status === 'confirmed') {
                    actionsHtml = `<button class="btn btn-primary action-btn w-full" data-action="run" data-id="${b.id}">Druck starten</button>`;
                } else if (b.status === 'running') {
                    actionsHtml = `<button class="btn btn-primary action-btn w-full" data-action="complete" data-id="${b.id}">Druck abschließen</button>`;
                }

                card.innerHTML = `
                    <div class="card-header">
                        <h3 class="card-title">${b.printerName}</h3>
                        <span class="badge ${b.status}">${translateStatus(b.status)}</span>
                    </div>
                    <div class="card-body">
                        <p class="text-sm"><strong>Zeit:</strong> ${b.startDate} - ${b.endDate}</p>
                        ${b.notes ? `<p class="text-sm text-muted"><strong>Notiz:</strong> ${b.notes}</p>` : ''}
                        ${b.message ? `<p class="text-sm" style="color:var(--danger)"><strong>Grund:</strong> ${b.message}</p>` : ''}
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
            
            const statusBtn = eq.status === 'Verfügbar' 
                ? `<button class="btn btn-secondary btn-sm action-btn" data-action="maintenance" data-id="${eq.id}">Wartung</button>`
                : `<button class="btn btn-primary btn-sm action-btn" data-action="available" data-id="${eq.id}">Aktivieren</button>`;

            card.innerHTML = `
                <div class="card-header">
                    <h3 class="card-title">${eq.name}</h3>
                    <span class="badge ${eq.status === 'Verfügbar' ? 'confirmed' : 'pending'}">${eq.status}</span>
                </div>
                <div class="card-body">
                    ${eq.image ? `<img src="${eq.image}" class="mb-2" style="width:100%; height:120px; object-fit:cover; border-radius:4px;">` : ''}
                    <p class="text-muted text-sm mb-1">${eq.description}</p>
                    <p class="text-sm"><strong>Typ:</strong> ${eq.type}</p>
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm action-btn" data-action="edit-device" data-id="${eq.id}" title="Bearbeiten">Bearbeiten</button>
                    ${statusBtn}
                    <button class="btn btn-danger btn-sm action-btn" data-action="delete-device" data-id="${eq.id}"><i data-lucide="trash-2"></i></button>
                </div>
            `;
            containers.equipment.appendChild(card);
        });
    }

    function handleTypeChange() {
        const type = forms.typeSelect.value;
        const is3D = (type === 'FDM_Drucker' || type === 'SLA_Drucker');
        if (is3D) {
            forms.specific3d.classList.remove('hidden');
            forms.volumeLabel.textContent = 'Bauvolumen';
        } else {
            forms.specific3d.classList.add('hidden');
            forms.volumeLabel.textContent = type === 'Papierdrucker' ? 'Formate (A4, A3)' : 'Arbeitsbereich';
        }
    }

    function openEditForm(id: string) {
        const device = getAllGeraete().find(g => g.id === id);
        if (!device) return;
        editingDeviceId = id;
        forms.formTitle.textContent = 'Gerät bearbeiten';
        (document.getElementById('eq-name') as HTMLInputElement).value = device.name;
        forms.typeSelect.value = device.type;
        (document.getElementById('eq-desc') as HTMLTextAreaElement).value = device.description;
        (document.getElementById('eq-volume') as HTMLInputElement).value = device.volume || '';
        (document.getElementById('eq-image') as HTMLInputElement).value = device.image || '';
        (document.getElementById('eq-nozzle') as HTMLInputElement).value = device.nozzle || '';
        (document.getElementById('eq-layer') as HTMLInputElement).value = device.layer || '';
        handleTypeChange();
        forms.add.classList.remove('hidden');
        forms.add.scrollIntoView({ behavior: 'smooth' });
    }

    function handleSaveEquipment() {
        const name = (document.getElementById('eq-name') as HTMLInputElement).value;
        const type = forms.typeSelect.value as Geraet['type'];
        const desc = (document.getElementById('eq-desc') as HTMLTextAreaElement).value;

        if (!name || !desc) {
            alert('Bitte Name und Beschreibung angeben.');
            return;
        }

        const deviceData: Geraet = {
            id: editingDeviceId || Date.now().toString(),
            name, type, description: desc,
            status: editingDeviceId ? (getAllGeraete().find(g => g.id === editingDeviceId)?.status || 'Verfügbar') : 'Verfügbar',
            image: (document.getElementById('eq-image') as HTMLInputElement).value,
            volume: (document.getElementById('eq-volume') as HTMLInputElement).value,
            nozzle: (document.getElementById('eq-nozzle') as HTMLInputElement).value || undefined,
            layer: (document.getElementById('eq-layer') as HTMLInputElement).value || undefined
        };

        if (editingDeviceId) {
            deleteGeraet(editingDeviceId);
            addGeraet(deviceData);
            editingDeviceId = null;
        } else {
            addGeraet(deviceData);
        }

        renderAll();
        forms.add.classList.add('hidden');
        resetInputs();
    }

    function setupEventListeners() {
        document.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('.action-btn') as HTMLElement;
            if (!target) return;
            const { action, id } = target.dataset;

            if (action === 'confirm') updateBookingStatus(id!, 'confirmed');
            if (action === 'run') updateBookingStatus(id!, 'running');
            if (action === 'complete') updateBookingStatus(id!, 'completed');
            if (action === 'reject') {
                currentRejectId = id!;
                modal.element.classList.remove('hidden');
            }
            if (action === 'maintenance') updateGeraetStatus(id!, 'Wartung');
            if (action === 'available') updateGeraetStatus(id!, 'Verfügbar');
            if (action === 'edit-device') openEditForm(id!);
            if (action === 'delete-device') {
                if(confirm('Gerät wirklich löschen?')) deleteGeraet(id!);
            }
            renderAll();
        });

        document.getElementById('btn-show-add-equipment')?.addEventListener('click', () => {
            editingDeviceId = null;
            forms.formTitle.textContent = 'Neues Gerät konfigurieren';
            resetInputs();
            forms.add.classList.remove('hidden');
        });

        document.getElementById('btn-cancel-equipment')?.addEventListener('click', () => forms.add.classList.add('hidden'));
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

    function translateStatus(s: string) {
        const map: any = { 'pending': 'Ausstehend', 'confirmed': 'Bestätigt', 'running': 'Läuft', 'completed': 'Fertig', 'rejected': 'Abgelehnt' };
        return map[s] || s;
    }

    function updateCounts(b: PrintBooking[], e: Geraet[]) {
        document.getElementById('count-pending')!.textContent = `(${b.filter(x => x.status === 'pending').length})`;
        document.getElementById('count-active')!.textContent = `(${b.filter(x => ['confirmed', 'running'].includes(x.status)).length})`;
        document.getElementById('count-completed')!.textContent = `(${b.filter(x => ['completed', 'rejected'].includes(x.status)).length})`;
        document.getElementById('count-equipment')!.textContent = `(${e.length})`;
    }

    function setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.addEventListener('click', () => {
            tabs.forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            t.classList.add('active');
            document.getElementById(`tab-${(t as HTMLElement).dataset.target}`)?.classList.add('active');
        }));
    }

    function resetInputs() {
        (document.getElementById('eq-name') as HTMLInputElement).value = '';
        (document.getElementById('eq-desc') as HTMLTextAreaElement).value = '';
        (document.getElementById('eq-volume') as HTMLInputElement).value = '';
        (document.getElementById('eq-image') as HTMLInputElement).value = '';
        (document.getElementById('eq-nozzle') as HTMLInputElement).value = '';
        (document.getElementById('eq-layer') as HTMLInputElement).value = '';
    }
});