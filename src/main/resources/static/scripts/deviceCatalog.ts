import { Device, ThreeDOptions, LaserOptions, PaperOptions } from "./models/device.js";
import { getAllDevices } from "./services/deviceService.js";

// Cache für Geräte, damit wir nicht bei jedem Klick neu laden müssen
let allDevicesCache: Device[] = [];

// Start: Daten laden, sobald die Seite bereit ist
document.addEventListener('DOMContentLoaded', async () => {
    try {
        allDevicesCache = await getAllDevices();
        renderDevices(allDevicesCache);
        setupFilterButtons();
    } catch (error) {
        console.error("Failed to load devices:", error);
        const container = document.getElementById('geraete-container');
        if (container) container.innerHTML = '<div class="alert alert-danger">Fehler beim Laden der Geräte. Ist das Backend gestartet?</div>';
    }
});

function renderDevices(data: Device[]): void {
    const container = document.getElementById('geraete-container');
    if (!container) return;

    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<div class="alert alert-danger w-full text-center">Keine Geräte in dieser Kategorie gefunden.</div>';
        return;
    }

    data.forEach((g) => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // --- STATUS LOGIK ---
        // 1. CSS Klasse bestimmen (Grün für Verfügbar, Gelb/Rot für Rest)
        // Backend liefert: 'Available', 'Maintenance', 'Defect', 'InUse'
        const statusClass = g.status === 'Available' ? 'confirmed' : 'pending';
        
        // 2. Anzeigetext übersetzen (Englisch -> Deutsch)
        let displayStatus = 'Unbekannt';
        switch (g.status) {
            case 'Available': displayStatus = 'Verfügbar'; break;
            case 'Unavailable': displayStatus = 'Wartung'; break;
            default: displayStatus = g.status;
        }

        // --- DETAILS LOGIK (Type Narrowing) ---
        let detailsHtml = '';

        if (g.type === 'FDM_Printer' || g.type === 'SLA_Printer') {
            const opts = g.print_options as ThreeDOptions;
            
            // Fallback für Düsen-Größen
            const nozzleStr = opts.nozzle_sizes && opts.nozzle_sizes.length > 0 
                ? opts.nozzle_sizes.join(', ') 
                : '-';

            detailsHtml = `
                <li><span class="text-muted">Bauraum:</span> <span>${opts.dimensions.x}x${opts.dimensions.y}x${opts.dimensions.z} mm</span></li>
                <li><span class="text-muted">Düse:</span> <span>${nozzleStr}</span></li>
            `;
        } 
        else if (g.type === 'Laser_Cutter' || g.type === 'CNC_Mill') {
            // Laser und CNC teilen sich hier oft die Logik (Work Area)
            const opts = g.print_options as LaserOptions;
            detailsHtml = `
                <li><span class="text-muted">Arbeitsfläche:</span> <span>${opts.work_area.x}x${opts.work_area.y} mm</span></li>
                <li><span class="text-muted">Profile:</span> <span>${opts.presets ? opts.presets.length : 0} Stück</span></li>
            `;
        } 
        else if (g.type === 'Printer') { // Papierdrucker
            const opts = g.print_options as PaperOptions;
            detailsHtml = `
                <li><span class="text-muted">Formate:</span> <span>${opts.formats.join(', ')}</span></li>
            `;
        }

        // HTML zusammenbauen
        card.innerHTML = `
            <img src="${g.image}" alt="${g.name}" loading="lazy" />
            <div class="card-body">
                <div class="card-header mb-1" style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h3 style="margin:0;">${g.name}</h3>
                    <span class="badge ${statusClass}">${displayStatus}</span>
                </div>
                <p class="text-muted text-sm mb-2">${g.description}</p>
                <ul>
                    ${detailsHtml}
                </ul>
            </div>
            <button class="btn btn-primary w-full mt-1 buchen-btn">Jetzt Buchen</button>
        `;

        const button = card.querySelector('.buchen-btn') as HTMLButtonElement;
        
        // Button deaktivieren, wenn nicht verfügbar
        if (g.status !== 'Available') {
            button.disabled = true;
            button.textContent = displayStatus; // Zeigt z.B. "Wartung" auf dem Button
            button.classList.add('btn-disabled'); // Optional für Styling
        } else {
            button.addEventListener('click', () => {
                window.location.href = `booking.html?device_id=${encodeURIComponent(g.id)}`;
            });
        }

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
            
            // Wir filtern den lokalen Cache
            let filtered = allDevicesCache;

            if (category !== 'Alle') {
                switch (category) {
                    case '3D-Drucker':
                        filtered = filtered.filter(g => g.type === 'FDM_Printer' || g.type === 'SLA_Printer');
                        break;
                    case 'Laserschneider':
                        filtered = filtered.filter(g => g.type === 'Laser_Cutter'); 
                        break;
                    case 'CNC-Fräsen': // Falls du einen Button dafür im HTML hast
                        filtered = filtered.filter(g => g.type === 'CNC_Mill');
                        break;
                    case 'Papierdrucker':
                        filtered = filtered.filter(g => g.type === 'Printer');
                        break;
                }
            }
            renderDevices(filtered);
        });
    });
}