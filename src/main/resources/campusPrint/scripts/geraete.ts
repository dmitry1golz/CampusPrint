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

let alleGeraete: Geraet[] = [];

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
          ${g.status === 'verfuegbar' ? 'Verfügbar' : 'Wartung'}
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
            window.location.href = `buchung.html?geraet=${encodeURIComponent(g.name)}`;
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
            if (category === 'Alle') {
                renderGeraete(alleGeraete);
            } else {
                const filtered = alleGeraete.filter((g) => g.category === category);
                renderGeraete(filtered);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('data/geraete.json')
        .then((res) => res.json())
        .then((data: Geraet[]) => {
            alleGeraete = data;
            renderGeraete(alleGeraete);
            setupFilterButtons();
        })
        .catch((err) => {
            const container = document.getElementById('geraete-container');
            if (container) container.innerHTML = '<div class="no-data">Fehler beim Laden</div>';
            console.error('Fehler beim Laden:', err);
        });
});
