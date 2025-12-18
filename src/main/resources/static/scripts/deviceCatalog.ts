import { Geraet } from "./models/geraet.js";
import { getAllGeraete } from "./services/geraet-service.js";

let alleGeraete: Geraet[] = getAllGeraete();

function renderGeraete(data: Geraet[]): void {
    const container = document.getElementById('geraete-container');
    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="alert alert-danger w-full text-center">Keine Geräte in dieser Kategorie verfügbar.</div>';
        return;
    }

    data.forEach((g) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Mapping der Status auf unsere Badge-Farben in base.css
        const statusClass = g.status === 'Verfügbar' ? 'confirmed' : 'pending';

        card.innerHTML = `
            <img src="${g.image}" alt="${g.name}" loading="lazy" />
            <div class="card-body">
                <div class="card-header mb-1" style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h3 style="margin:0;">${g.name}</h3>
                    <span class="badge ${statusClass}">${g.status}</span>
                </div>
                <p class="text-muted text-sm mb-2">${g.description}</p>
                <ul>
                    <li><span class="text-muted">Volumen:</span> <span>${g.volume || '-'}</span></li>
                    <li><span class="text-muted">Layer:</span> <span>${g.layer || '-'}</span></li>
                    <li><span class="text-muted">Nozzle:</span> <span>${g.nozzle || '-'}</span></li>
                </ul>
            </div>
            <button class="btn btn-primary w-full mt-1 buchen-btn">Jetzt Buchen</button>
        `;

        const button = card.querySelector('.buchen-btn') as HTMLButtonElement;
        button.addEventListener('click', () => {
            window.location.href = `buchung.html?geraet_id=${encodeURIComponent(g.id)}`;
        });

        container.appendChild(card);
    });
}

function setupFilterButtons(): void {
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');
            let filtered = getAllGeraete();

            if (category !== 'Alle') {
                switch (category) {
                    case '3D-Drucker':
                        filtered = filtered.filter(g => g.type.includes('Drucker'));
                        break;
                    case 'CNC-Fräsen':
                        filtered = filtered.filter(g => g.type === "CNC_Fräse");
                        break;
                    case 'Laserschneider':
                        filtered = filtered.filter(g => g.type === "Lasercutter");
                        break;
                    case 'Papierdrucker':
                        filtered = filtered.filter(g => g.type === "Papierdrucker");
                        break;
                }
            }
            renderGeraete(filtered);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderGeraete(alleGeraete);
    setupFilterButtons();
});