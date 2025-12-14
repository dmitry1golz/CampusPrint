// --- Interfaces ---
interface Booking {
    id: string;
    studentName: string;
    equipmentId: string;
    equipmentName: string;
    date: string;
    startTime: string;
    endTime: string;
    status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
    note?: string;
    rejectReason?: string;
}

interface Equipment {
    id: string;
    name: string;
    type: string;
    status: 'available' | 'maintenance';
    description: string;
}

document.addEventListener('DOMContentLoaded', () => {

    // --- State (Dummy Data) ---
    let bookings: Booking[] = [
        { 
            id: '1', 
            studentName: 'Max Mustermann', 
            equipmentId: 'p1',
            equipmentName: 'Prusa i3 MK3', 
            date: '20.03.2025', 
            startTime: '10:00',
            endTime: '12:00',
            status: 'pending', 
            note: 'Druck für Bachelorarbeit, PLA Weiß' 
        },
        { 
            id: '2', 
            studentName: 'Lisa Schmidt', 
            equipmentId: 'l1', 
            equipmentName: 'Epilog Laser',
            date: '21.03.2025', 
            startTime: '14:00', 
            endTime: '15:00',
            status: 'confirmed' 
        }
    ];

    let equipmentList: Equipment[] = [
        { id: 'p1', name: 'Prusa i3 MK3', type: '3D-Drucker', status: 'available', description: 'Standard FDM Drucker' },
        { id: 'l1', name: 'Epilog Laser', type: 'Laserschneider', status: 'available', description: '60 Watt CO2 Laser' }
    ];

    let currentRejectId: string | null = null;

    // --- DOM Elements ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    // Container
    const containers = {
        pending: document.getElementById('pending-list') as HTMLDivElement,
        active: document.getElementById('active-list') as HTMLDivElement,
        completed: document.getElementById('completed-list') as HTMLDivElement,
        equipment: document.getElementById('equipment-list') as HTMLDivElement
    };

    // Modal
    const rejectModal = document.getElementById('reject-modal') as HTMLDivElement;
    const rejectReasonInput = document.getElementById('reject-reason') as HTMLTextAreaElement;
    
    // Forms
    const addEqForm = document.getElementById('add-equipment-form') as HTMLDivElement;


    // --- Init ---
    renderAll();

    // --- Tab Switching Logic ---
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Reset
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Set Active
            btn.classList.add('active');
            const target = (btn as HTMLElement).dataset.target;
            const targetPane = document.getElementById(`tab-${target}`);
            if (targetPane) targetPane.classList.add('active');
        });
    });


    // --- Rendering Functions ---
    function renderAll() {
        renderList('pending', containers.pending);
        renderList('active', containers.active);
        renderList('completed', containers.completed);
        renderEquipment();
        updateCounts();
        
        // Icons neu laden (Lucide)
        // @ts-ignore
        if (window.lucide) window.lucide.createIcons();
    }

    function renderList(viewType: string, container: HTMLDivElement) {
        container.innerHTML = '';
        let filtered: Booking[] = [];

        if (viewType === 'pending') filtered = bookings.filter(b => b.status === 'pending');
        else if (viewType === 'active') filtered = bookings.filter(b => b.status === 'confirmed' || b.status === 'active');
        else if (viewType === 'completed') filtered = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

        // Toggle Empty Message
        const emptyMsg = document.getElementById(`${viewType}-empty`);
        if (filtered.length === 0) {
            if (emptyMsg) emptyMsg.classList.remove('hidden');
        } else {
            if (emptyMsg) emptyMsg.classList.add('hidden');
            
            filtered.forEach(b => {
                const card = document.createElement('div');
                card.className = 'card';
                
                // Determine Actions based on status
                let actionsHtml = '';
                if (b.status === 'pending') {
                    actionsHtml = `
                        <button class="btn-primary btn-sm action-btn" data-action="confirm" data-id="${b.id}">
                            <i data-lucide="check"></i> Bestätigen
                        </button>
                        <button class="btn-danger btn-sm action-btn" data-action="reject" data-id="${b.id}">
                            <i data-lucide="x"></i> Ablehnen
                        </button>
                    `;
                } else if (b.status === 'confirmed') {
                    actionsHtml = `
                        <button class="btn-primary btn-sm action-btn" data-action="start" data-id="${b.id}">
                            <i data-lucide="play"></i> Starten
                        </button>`;
                } else if (b.status === 'active') {
                    actionsHtml = `
                        <button class="btn-primary btn-sm action-btn" data-action="complete" data-id="${b.id}">
                            <i data-lucide="check-circle"></i> Abschließen
                        </button>`;
                }

                card.innerHTML = `
                    <div class="card-header">
                        <span class="card-title">${b.equipmentName}</span>
                        <span class="badge ${b.status}">${translateStatus(b.status)}</span>
                    </div>
                    <div class="card-details">
                        <p><strong>Student:</strong> ${b.studentName}</p>
                        <p><strong>Zeit:</strong> ${b.date}, ${b.startTime} - ${b.endTime}</p>
                        ${b.note ? `<p><strong>Notiz:</strong> ${b.note}</p>` : ''}
                        ${b.rejectReason ? `<p style="color:var(--danger)"><strong>Grund:</strong> ${b.rejectReason}</p>` : ''}
                    </div>
                    ${actionsHtml ? `<div class="card-actions">${actionsHtml}</div>` : ''}
                `;
                container.appendChild(card);
            });
        }
    }

    function renderEquipment() {
        containers.equipment.innerHTML = '';
        equipmentList.forEach(eq => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-header">
                    <span class="card-title">${eq.name}</span>
                    <span class="badge ${eq.status}">${eq.status === 'available' ? 'Verfügbar' : 'Wartung'}</span>
                </div>
                <div class="card-details">
                    <p><strong>Typ:</strong> ${eq.type}</p>
                    <p>${eq.description}</p>
                </div>
            `;
            containers.equipment.appendChild(card);
        });
    }

    function updateCounts() {
        document.getElementById('count-pending')!.textContent = `(${bookings.filter(b => b.status === 'pending').length})`;
        document.getElementById('count-active')!.textContent = `(${bookings.filter(b => ['confirmed', 'active'].includes(b.status)).length})`;
        document.getElementById('count-completed')!.textContent = `(${bookings.filter(b => ['completed', 'cancelled'].includes(b.status)).length})`;
        document.getElementById('count-equipment')!.textContent = `(${equipmentList.length})`;
    }

    function translateStatus(status: string) {
        const map: {[key: string]: string} = {
            'pending': 'Ausstehend',
            'confirmed': 'Bestätigt',
            'active': 'Läuft',
            'completed': 'Fertig',
            'cancelled': 'Abgelehnt'
        };
        return map[status] || status;
    }


    // --- Event Listeners (Action Handling) ---
    
    // Helper for Delegation
    const handleAction = (e: Event) => {
        const target = (e.target as HTMLElement).closest('.action-btn') as HTMLElement;
        if (!target) return;
        
        const action = target.dataset.action;
        const id = target.dataset.id;
        if (!id) return;

        if (action === 'confirm') updateStatus(id, 'confirmed');
        else if (action === 'start') updateStatus(id, 'active');
        else if (action === 'complete') updateStatus(id, 'completed');
        else if (action === 'reject') {
            currentRejectId = id;
            rejectModal.classList.remove('hidden');
        }
    };

    // Attach listeners to containers
    containers.pending.addEventListener('click', handleAction);
    containers.active.addEventListener('click', handleAction);

    function updateStatus(id: string, newStatus: Booking['status']) {
        const booking = bookings.find(b => b.id === id);
        if (booking) {
            booking.status = newStatus;
            renderAll();
        }
    }


    // --- Modal Logic ---
    document.getElementById('btn-confirm-reject')?.addEventListener('click', () => {
        if (currentRejectId && rejectReasonInput.value.trim()) {
            const booking = bookings.find(b => b.id === currentRejectId);
            if (booking) {
                booking.status = 'cancelled';
                booking.rejectReason = rejectReasonInput.value;
                renderAll();
            }
            closeModal();
        } else {
            alert('Bitte gib einen Grund an.');
        }
    });

    document.getElementById('btn-cancel-reject')?.addEventListener('click', closeModal);

    function closeModal() {
        rejectModal.classList.add('hidden');
        rejectReasonInput.value = '';
        currentRejectId = null;
    }


    // --- Equipment Form Logic ---
    document.getElementById('btn-show-add-equipment')?.addEventListener('click', () => {
        addEqForm.classList.remove('hidden');
    });

    document.getElementById('btn-cancel-equipment')?.addEventListener('click', () => {
        addEqForm.classList.add('hidden');
    });

    document.getElementById('btn-save-equipment')?.addEventListener('click', () => {
        const nameInput = document.getElementById('eq-name') as HTMLInputElement;
        const typeInput = document.getElementById('eq-type') as HTMLSelectElement;
        const descInput = document.getElementById('eq-desc') as HTMLTextAreaElement;

        if (nameInput.value && descInput.value) {
            equipmentList.push({
                id: Date.now().toString(),
                name: nameInput.value,
                type: typeInput.value,
                description: descInput.value,
                status: 'available'
            });
            renderAll();
            addEqForm.classList.add('hidden');
            // Reset
            nameInput.value = '';
            descInput.value = '';
        } else {
            alert('Bitte fülle alle Felder aus.');
        }
    });

});