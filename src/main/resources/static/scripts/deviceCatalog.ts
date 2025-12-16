import {Geraet} from "./models/geraet.js";
import {getAllGeraete} from "./services/geraet-service.js";


let alleGeraete: Geraet[] = getAllGeraete();

function renderGeraete(data: Geraet[]): void {
    const container = document.getElementById('geraete-container');
    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="no-data">Keine Geräte verfügbar</div>';
        return;
    }

    data.forEach((g) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
      <img src="${g.image}" alt="${g.name}" />
      <div class="card-body">
        <span class="status ${g.status}">
          ${g.status === 'Verfügbar' ? 'Verfügbar' : 'Wartung'}
        </span>
        <h3>${g.name}</h3>
        <p>${g.description}</p>
        <ul>
          <li><strong>Build Volume:</strong> ${g.volume}</li>
          <li><strong>Layer Height:</strong> ${g.layer}</li>
          <li><strong>Nozzle:</strong> ${g.nozzle}</li>
        </ul>
      </div>
      <button class="btn">Buchen</button>
    `;

        const button = card.querySelector('.btn') as HTMLButtonElement;
        button.addEventListener('click', () => {
            window.location.href = `buchung.html?geraet_id=${encodeURIComponent(g.id)}`;
        });

        container.appendChild(card);
    });
}

function setupFilterButtons(): void {
    const buttons = document.querySelectorAll('.filter-btn');
    const container = document.getElementById('geraete-container');
    if (!container) return;

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');
            var filtered: Geraet[] = getAllGeraete();
            switch (category) {
                case '3D-Drucker':
                    filtered = filtered.filter(
                        (g) => g.type === "FDM_Drucker" || g.type === "SLA_Drucker");
                    break;
                case 'CNC-Fräsen':
                    filtered = filtered.filter(
                        (g) => g.type === "CNC_Fräse");
                    break;
                    case 'Laserschneider':
                        filtered = filtered.filter(
                            (g) => g.type === "Lasercutter");
                        break;

                case 'Papierdrucker':
                    filtered = filtered.filter(
                        (g) => g.type === "Papierdrucker");
                    break;
                default :
                    break;
            }
            if (category === 'Alle') {
                renderGeraete(alleGeraete);
            } else {
                renderGeraete(filtered);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderGeraete(alleGeraete);
    setupFilterButtons();
});
