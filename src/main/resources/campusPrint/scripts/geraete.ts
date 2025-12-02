interface Geraet {
    name: string;
    description: string;
    volume: string;
    layer: string;
    nozzle: string;
    image: string;
    status: 'verfuegbar' | 'wartung';
    category: string;
}

let allGeraete: Geraet[] = [];

/**
 * Card rendering function
 */
function renderGeraete(data: Geraet[], container: HTMLElement): void {
    container.innerHTML = '';

    if (data.length === 0) {
        const message = document.createElement('div');
        message.className = 'no-data';
        message.textContent = 'Drucker noch nicht hinzugefügt';
        container.appendChild(message);
        return;
    }

    data.forEach((geraet) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('data-category', geraet.category);

        card.innerHTML = `
      <img src="${geraet.image}" alt="${geraet.name}" />
      <div class="card-body">
        <span class="status ${geraet.status}">
          ${geraet.status === 'verfuegbar' ? 'Verfügbar' : 'Wartung'}
        </span>
        <h3>${geraet.name}</h3>
        <p>${geraet.description}</p>
        <ul>
          <li><strong>Build Volume:</strong> ${geraet.volume}</li>
          <li><strong>Layer Height:</strong> ${geraet.layer}</li>
          <li><strong>Nozzle:</strong> ${geraet.nozzle}</li>
        </ul>
      </div>
      <button class="btn">Buchen</button>
    `;

        container.appendChild(card);
    });
}

/**
 * Downloading a JSON file from the server
 */
async function loadGeraete(): Promise<void> {
    const container = document.getElementById('geraete-container');
    if (!container) return;

    try {
        const response = await fetch('../data/geraete.json');
        if (!response.ok) throw new Error('Fehler beim Laden der Daten');
        const data: Geraet[] = await response.json();
        allGeraete = data;
        renderGeraete(allGeraete, container);
    } catch (error) {
        console.error(error);
        container.innerHTML = `<div class="no-data">Ошибка загрузки данных</div>`;
    }
}

/**
 * Configuring filter buttons
 */
function setupFilterButtons(): void {
    const buttons = document.querySelectorAll('.filter-btn');
    const container = document.getElementById('geraete-container');
    if (!container) return;

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            buttons.forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');

            const category = button.getAttribute('data-category');

            if (category === 'Alle') {
                renderGeraete(allGeraete, container);
            } else {
                const filtered = allGeraete.filter(
                    (geraet) => geraet.category === category
                );
                renderGeraete(filtered, container);
            }
        });
    });
}

/**
 * Initialisierung beim Laden der Seite
 */
document.addEventListener('DOMContentLoaded', async () => {
    await loadGeraete();
    setupFilterButtons();
});
