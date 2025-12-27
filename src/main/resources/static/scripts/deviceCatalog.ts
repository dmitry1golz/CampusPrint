import { Geraet, ThreeDOptions, LaserOptions, PaperOptions } from "./models/geraet.js";
import { getAllGeraete } from "./services/geraet-service.js";

// We need a local cache because getAllGeraete is async and we don't want to fetch 
// on every filter click.
let allDevicesCache: Geraet[] = [];

// Initialize as async to wait for data
document.addEventListener('DOMContentLoaded', async () => {
    try {
        allDevicesCache = await getAllGeraete();
        renderGeraete(allDevicesCache);
        setupFilterButtons();
    } catch (error) {
        console.error("Failed to load devices:", error);
        const container = document.getElementById('geraete-container');
        if (container) container.innerHTML = '<div class="alert alert-danger">Error loading devices.</div>';
    }
});

function renderGeraete(data: Geraet[]): void {
    const container = document.getElementById('geraete-container');
    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="alert alert-danger w-full text-center">No devices available in this category.</div>';
        return;
    }

    data.forEach((g) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Map status to CSS classes
        const statusClass = g.status === 'Verfügbar' ? 'confirmed' : 'pending';

        // Dynamic Info extraction based on device type
        let detailsHtml = '';

        if (g.type === 'FDM_Drucker' || g.type === 'SLA_Drucker') {
            const opts = g.print_options as ThreeDOptions;
            detailsHtml = `
                <li><span class="text-muted">Volume:</span> <span>${opts.dimensions.x}x${opts.dimensions.y}x${opts.dimensions.z}mm</span></li>
                <li><span class="text-muted">Nozzle:</span> <span>${opts.nozzle_sizes?.join(', ') || '-'}</span></li>
            `;
        } else if (g.type === 'Lasercutter') {
            const opts = g.print_options as LaserOptions;
            detailsHtml = `
                <li><span class="text-muted">Work Area:</span> <span>${opts.work_area.x}x${opts.work_area.y}mm</span></li>
                <li><span class="text-muted">Power:</span> <span>Pro Series</span></li>
            `;
        } else if (g.type === 'Papierdrucker') {
            const opts = g.print_options as PaperOptions;
            detailsHtml = `
                <li><span class="text-muted">Formats:</span> <span>${opts.formats.join(', ')}</span></li>
            `;
        }

        card.innerHTML = `
            <img src="${g.image}" alt="${g.name}" loading="lazy" />
            <div class="card-body">
                <div class="card-header mb-1" style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h3 style="margin:0;">${g.name}</h3>
                    <span class="badge ${statusClass}">${g.status}</span>
                </div>
                <p class="text-muted text-sm mb-2">${g.description}</p>
                <ul>
                    ${detailsHtml}
                </ul>
            </div>
            <button class="btn btn-primary w-full mt-1 buchen-btn">Book Now</button>
        `;

        const button = card.querySelector('.buchen-btn') as HTMLButtonElement;
        button.addEventListener('click', () => {
            // Encode ID to be URL safe
            window.location.href = `buchung.html?geraet_id=${encodeURIComponent(g.id)}`;
        });

        container.appendChild(card);
    });
}

function setupFilterButtons(): void {
    const buttons = document.querySelectorAll('.filter-btn');
    
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            // UI Toggle
            document.querySelector('.filter-btn.active')?.classList.remove('active');
            btn.classList.add('active');

            const category = btn.getAttribute('data-category');
            
            // Filter logic using the local cache instead of fetching again
            let filtered = allDevicesCache;

            if (category !== 'Alle') {
                switch (category) {
                    case '3D-Drucker':
                        // Check for both types of printers
                        filtered = filtered.filter(g => g.type.includes('Drucker') && g.type !== 'Papierdrucker');
                        break;
                    case 'Laserschneider':
                        filtered = filtered.filter(g => g.type === "Lasercutter");
                        break;
                    case 'Papierdrucker':
                        filtered = filtered.filter(g => g.type === "Papierdrucker");
                        break;
                    // CNC case removed as per previous instructions
                }
            }
            renderGeraete(filtered);
        });
    });
}