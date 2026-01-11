import { Device, FdmOptions, LaserOptions, PaperOptions, SlaOptions } from "./models/device.js";
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
        let deviceTypeLabel = '';

        if (g.type === 'FDM_Printer') {
            deviceTypeLabel = 'FDM 3D-Drucker';
            const opts = g.print_options as FdmOptions;
            
            const nozzleStr = opts.nozzle_sizes && opts.nozzle_sizes.length > 0 
                ? opts.nozzle_sizes.map(n => `${n}mm`).join(', ') 
                : '-';
            
            const layerHeightsStr = opts.supported_layer_heights && opts.supported_layer_heights.length > 0
                ? opts.supported_layer_heights.map(l => `${l}mm`).join(', ')
                : '-';
            
            let materialsHtml = '';
            if (opts.available_materials && opts.available_materials.length > 0) {
                materialsHtml = opts.available_materials.map(m => 
                    `<span class="material-badge" 
                          style="background:${m.color_hex}20; border-left: 3px solid ${m.color_hex};" 
                          data-tooltip="Düse: ${m.temp_nozzle}°C | Bett: ${m.temp_bed}°C | Farbe: ${m.color_hex}">
                        ${m.name}
                    </span>`
                ).join('');
            }

            detailsHtml = `
                <li><span class="detail-label">Bauraum:</span> <span class="detail-value">${opts.work_area.x} × ${opts.work_area.y} × ${opts.work_area.z} mm</span></li>
                <li><span class="detail-label">Düsengrößen:</span> <span class="detail-value">${nozzleStr}</span></li>
                <li><span class="detail-label">Schichthöhen:</span> <span class="detail-value">${layerHeightsStr}</span></li>
                <li class="materials-section">
                    <span class="detail-label">Verfügbare Materialien:</span>
                    <div class="materials-grid">${materialsHtml || '<span class="text-muted">Keine</span>'}</div>
                </li>
            `;
        } 
        else if (g.type === 'SLA_Printer') {
            deviceTypeLabel = 'SLA 3D-Drucker';
            const opts = g.print_options as SlaOptions;
            
            const layerHeightsStr = opts.supported_layer_heights && opts.supported_layer_heights.length > 0
                ? opts.supported_layer_heights.map(l => `${l}mm`).join(', ')
                : '-';
            
            let materialsHtml = '';
            if (opts.available_materials && opts.available_materials.length > 0) {
                materialsHtml = opts.available_materials.map(m => 
                    `<span class="material-badge" 
                          style="background:${m.color_hex}20; border-left: 3px solid ${m.color_hex};" 
                          data-tooltip="Farbe: ${m.color_hex}">
                        ${m.name}
                    </span>`
                ).join('');
            }
            
            detailsHtml = `
                <li><span class="detail-label">Bauraum:</span> <span class="detail-value">${opts.work_area.x} × ${opts.work_area.y} × ${opts.work_area.z} mm</span></li>
                <li><span class="detail-label">Schichthöhen:</span> <span class="detail-value">${layerHeightsStr}</span></li>
                <li class="materials-section">
                    <span class="detail-label">Verfügbare Harze:</span>
                    <div class="materials-grid">${materialsHtml || '<span class="text-muted">Keine</span>'}</div>
                </li>
            `;
        }
        else if (g.type === 'Laser_Cutter') {
            deviceTypeLabel = 'Laserschneider';
            const opts = g.print_options as LaserOptions;
            
            let presetsHtml = '';
            if (opts.presets && opts.presets.length > 0) {
                presetsHtml = opts.presets.map(p => 
                    `<div class="preset-item">
                        <strong>${p.material}</strong>
                        <span class="preset-details">${p.thickness}mm · ${p.power}% Power · ${p.speed}% Speed</span>
                    </div>`
                ).join('');
            }
            
            detailsHtml = `
                <li><span class="detail-label">Arbeitsfläche:</span> <span class="detail-value">${opts.work_area.x} × ${opts.work_area.y} mm</span></li>
                <li class="presets-section">
                    <span class="detail-label">Material-Presets:</span>
                    <div class="presets-list">${presetsHtml || '<span class="text-muted">Keine</span>'}</div>
                </li>
            `;
        } 
        else if (g.type === 'Printer') { // Papierdrucker
            deviceTypeLabel = 'Papierdrucker';
            const opts = g.print_options as PaperOptions;
            
            const formatsHtml = opts.formats.map(f => 
                `<span class="format-badge">${f}</span>`
            ).join('');
            
            const weightsStr = opts.paper_weights && opts.paper_weights.length > 0
                ? opts.paper_weights.map(w => `${w}g/m²`).join(', ')
                : '-';
            
            detailsHtml = `
                <li class="formats-section">
                    <span class="detail-label">Formate:</span>
                    <div class="formats-grid">${formatsHtml}</div>
                </li>
                <li><span class="detail-label">Papiergewichte:</span> <span class="detail-value">${weightsStr}</span></li>
            `;
        }

        // HTML zusammenbauen
        card.innerHTML = `
            <img src="${g.image}" alt="${g.name}" loading="lazy" />
            <div class="card-body">
                <div class="card-header mb-1" style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <h3 style="margin:0;">${g.name}</h3>
                        <div class="device-type-label">${deviceTypeLabel}</div>
                    </div>
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
                    case 'Papierdrucker':
                        filtered = filtered.filter(g => g.type === 'Printer');
                        break;
                }
            }
            renderDevices(filtered);
        });
    });
}