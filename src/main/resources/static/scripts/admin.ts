import { PrintBooking } from './models/buchungs.js';
import { Geraet } from './models/geraet.js';
import { getAllBookings, updateBookingStatus } from './services/buchung-service.js';
import { getAllGeraete, addGeraet, deleteGeraet, updateGeraetStatus } from './services/geraet-service.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- State ---
    let currentRejectId: string | null = null;

    // --- DOM Elements Caching ---
    const containers = {
        pending: document.getElementById('pending-list') as HTMLDivElement,
        active: document.getElementById('active-list') as HTMLDivElement,
        completed: document.getElementById('completed-list') as HTMLDivElement,
        equipment: document.getElementById('equipment-list') as HTMLDivElement
    };

    const forms = {
        add: document.getElementById('add-equipment-form') as HTMLDivElement,
        typeSelect: document.getElementById('eq-type') as HTMLSelectElement,
        specific3d: document.getElementById('specific-3d-fields') as HTMLDivElement,
        volumeLabel: document.getElementById('label-volume') as HTMLLabelElement
    };

    const modal = {
        element: document.getElementById('reject-modal') as HTMLDivElement,
        reasonInput: document.getElementById('reject-reason') as HTMLTextAreaElement
    };

    // --- Initialization ---
    init();

    function init() {
        setupTabs();
        setupEventListeners();
        // Einmal initial rendern
        renderAll();
        // Formular Status initialisieren (versteckt/zeigt Felder)
        handleTypeChange();
    }

    // --- Rendering Logic ---

    function renderAll() {
        // Daten frisch aus den Services holen
        const bookings = getAllBookings();
        const equipment = getAllGeraete();

        renderBookingList('pending', bookings, containers.pending);
        renderBookingList('active', bookings, containers.active);
        renderBookingList('completed', bookings, containers.completed);
        renderEquipmentList(equipment);
        
        updateCounts(bookings, equipment);
        
        // Icons neu initialisieren
        // @ts-ignore
        if (window.lucide) window.lucide.createIcons();
    }

    function renderBookingList(viewType: string, allBookings: PrintBooking[], container: HTMLDivElement) {
        container.innerHTML = '';
        let filtered: PrintBooking[] = [];

        // Filterlogik
        if (viewType === 'pending') filtered = allBookings.filter(b => b.status === 'pending');
        else if (viewType === 'active') filtered = allBookings.filter(b => ['confirmed', 'running'].includes(b.status));
        else if (viewType === 'completed') filtered = allBookings.filter(b => ['completed', 'rejected'].includes(b.status));

        // Empty State Check
        const emptyMsg = document.getElementById(`${viewType}-empty`);
        if (filtered.length === 0) {
            if (emptyMsg) emptyMsg.classList.remove('hidden');
        } else {
            if (emptyMsg) emptyMsg.classList.add('hidden');
            
            filtered.forEach(b => {
                const card = document.createElement('div');
                card.className = 'card';
                
                // Dynamische Buttons je nach Status
                let actionsHtml = '';
                if (b.status === 'pending') {
                    actionsHtml = `
                        <button class="btn-primary action-btn" data-action="confirm" data-id="${b.id}"><i data-lucide="check"></i></button>
                        <button class="btn-danger action-btn" data-action="reject" data-id="${b.id}"><i data-lucide="x"></i></button>
                    `;
                } else if (b.status === 'confirmed') {
                    actionsHtml = `<button class="btn-primary action-btn" data-action="run" data-id="${b.id}">Starten</button>`;
                } else if (b.status === 'running') {
                    actionsHtml = `<button class="btn-primary action-btn" data-action="complete" data-id="${b.id}">Abschließen</button>`;
                }

                card.innerHTML = `
                    <div class="card-header">
                        <span class="card-title">${b.printerName}</span>
                        <span class="badge" data-status="${b.status}">${translateStatus(b.status)}</span>
                    </div>
                    <div class="card-body">
                        <p><strong>Student:</strong> TODO (User Service)</p>
                        <p><strong>Zeit:</strong> ${b.startDate} - ${b.endDate}</p>
                        ${b.notes ? `<p><strong>Notiz:</strong> ${b.notes}</p>` : ''}
                        ${b.message ? `<p style="color:var(--danger)"><strong>Grund:</strong> ${b.message}</p>` : ''}
                    </div>
                    <div class="card-actions">${actionsHtml}</div>
                `;
                container.appendChild(card);
            });
        }
    }

    function renderEquipmentList(equipment: Geraet[]) {
        containers.equipment.innerHTML = '';
        equipment.forEach(eq => {
            const card = document.createElement('div');
            card.className = 'card';
            
            // Toggle Button (Wartung/Verfügbar)
            const statusBtn = eq.status === 'Verfügbar' 
                ? `<button class="btn-secondary action-btn" data-action="maintenance" data-id="${eq.id}">Wartung</button>`
                : `<button class="btn-primary action-btn" data-action="available" data-id="${eq.id}">Verfügbar</button>`;

            // Dynamische Details anzeigen
            let details = `<p><strong>Typ:</strong> ${eq.type}</p>`;
            
            // Label Anpassung (Format vs. Volumen)
            const volLabel = eq.type === 'Papierdrucker' ? 'Formate' : 'Volumen';
            if (eq.volume) details += `<p><strong>${volLabel}:</strong> ${eq.volume}</p>`;
            
            // Spezifische 3D Infos
            if (eq.nozzle) details += `<p><strong>Nozzle:</strong> ${eq.nozzle}</p>`;

            card.innerHTML = `
                <div class="card-header">
                    <span class="card-title">${eq.name}</span>
                    <span class="badge" data-status="${eq.status}">${eq.status}</span>
                </div>
                <div class="card-body">
                    ${eq.image ? `<img src="${eq.image}" style="width:100%; height:120px; object-fit:cover; border-radius:4px; margin-bottom:0.5rem;">` : ''}
                    <div style="margin-bottom:0.5rem; font-style:italic;">${eq.description}</div>
                    ${details}
                </div>
                <div class="card-actions">
                    ${statusBtn}
                    <button class="btn-danger action-btn" data-action="delete-device" data-id="${eq.id}"><i data-lucide="trash-2"></i></button>
                </div>
            `;
            containers.equipment.appendChild(card);
        });
    }

    // --- Interaction & Form Logic ---

    function handleTypeChange() {
        const type = forms.typeSelect.value;
        // Zeige erweiterte Felder nur bei 3D Druckern
        const is3D = (type === 'FDM_Drucker' || type === 'SLA_Drucker');
        
        if (is3D) {
            forms.specific3d.classList.remove('hidden');
            forms.volumeLabel.textContent = 'Bauvolumen';
        } else {
            forms.specific3d.classList.add('hidden');
            if (type === 'Papierdrucker') forms.volumeLabel.textContent = 'Formate (A4, A3)';
            else forms.volumeLabel.textContent = 'Arbeitsbereich';
        }
    }

    function handleAddEquipment() {
        // Werte auslesen
        const name = (document.getElementById('eq-name') as HTMLInputElement).value;
        const type = forms.typeSelect.value as Geraet['type'];
        const desc = (document.getElementById('eq-desc') as HTMLTextAreaElement).value;
        const volume = (document.getElementById('eq-volume') as HTMLInputElement).value;
        const image = (document.getElementById('eq-image') as HTMLInputElement).value;
        
        // Validierung
        if (!name || !desc) {
            alert('Bitte Name und Beschreibung angeben.');
            return;
        }

        const newDevice: Geraet = {
            id: Date.now().toString(),
            name, type, description: desc,
            status: 'Verfügbar',
            image: image || '',
            volume: volume || '',
            // Optionale Felder nur befüllen wenn sichtbar
            nozzle: !forms.specific3d.classList.contains('hidden') ? (document.getElementById('eq-nozzle') as HTMLInputElement).value : undefined,
            layer: !forms.specific3d.classList.contains('hidden') ? (document.getElementById('eq-layer') as HTMLInputElement).value : undefined
        };

        addGeraet(newDevice);
        renderAll();
        forms.add.classList.add('hidden');
        resetInputs();
    }

    // --- Global Event Listener (Delegation) ---
    function setupEventListeners() {
        document.addEventListener('click', (e) => {
            const target = (e.target as HTMLElement).closest('.action-btn') as HTMLElement;
            if (!target) return;
            const { action, id } = target.dataset;

            // Booking Actions
            if (action === 'confirm') updateBookingStatus(id!, 'confirmed');
            if (action === 'run') updateBookingStatus(id!, 'running');
            if (action === 'complete') updateBookingStatus(id!, 'completed');
            if (action === 'reject') {
                currentRejectId = id!;
                modal.element.classList.remove('hidden');
            }

            // Equipment Actions
            if (action === 'maintenance') updateGeraetStatus(id!, 'Wartung');
            if (action === 'available') updateGeraetStatus(id!, 'Verfügbar');
            if (action === 'delete-device') {
                if(confirm('Gerät wirklich löschen?')) deleteGeraet(id!);
            }

            renderAll();
        });

        // Formular UI Events
        document.getElementById('btn-show-add-equipment')?.addEventListener('click', () => forms.add.classList.remove('hidden'));
        document.getElementById('btn-cancel-equipment')?.addEventListener('click', () => forms.add.classList.add('hidden'));
        document.getElementById('btn-save-equipment')?.addEventListener('click', handleAddEquipment);
        forms.typeSelect.addEventListener('change', handleTypeChange);

        // Modal Events
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

    // --- Utils ---
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
        // Weitere Resets hier...
    }
});