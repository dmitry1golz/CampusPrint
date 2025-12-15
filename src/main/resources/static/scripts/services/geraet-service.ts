// WICHTIG: Import der Models
import { Geraet, ThreeDPrinter } from '../models/geraet.js';

// MOCK DATEN
// Wir nutzen 'let', damit der Admin Geräte hinzufügen/löschen kann
export let MOCK_GERAETE: Geraet[] = [
    // --- 3D DRUCKER (FDM) ---
    {
        id: 'p1',
        name: 'Ultimaker S5',
        type: 'FDM_Drucker',
        status: 'Verfügbar',
        description: "Professioneller Dual-Extrusion Drucker. Geeignet für PLA, ABS, PETG und PVA (Support).",
        image: "https://ultimaker.com/wp-content/uploads/2023/05/The_Ultimaker_S5.jpg",
        volume: '330 x 240 x 300 mm',
        nozzle: "0.4mm AA / BB",
        layer: "0.1mm - 0.2mm"
    },
    {
        id: 'p2',
        name: 'Prusa MK4',
        type: 'FDM_Drucker',
        status: 'Wartung',
        description: "Schneller Prototyping-Drucker mit Input Shaper. Momentan Düsenwechsel.",
        image: "https://www.prusa3d.com/content/images/product/default/228.jpg",
        volume: '250 x 210 x 210 mm',
        nozzle: "0.4mm",
        layer: "0.2mm"
    },
    {
        id: 'p3',
        name: 'Bambu Lab X1 Carbon',
        type: 'FDM_Drucker',
        status: 'Verfügbar',
        description: "High-Speed Drucker mit Multi-Color Support (AMS). Ideal für mehrfarbige Modelle.",
        image: "https://eu.store.bambulab.com/cdn/shop/products/X1-Carbon-Combo_1000x.jpg",
        volume: '256 x 256 x 256 mm',
        nozzle: "0.4mm Hardened",
        layer: "0.08mm - 0.2mm"
    },

    // --- 3D DRUCKER (SLA) ---
    {
        id: 'sla1',
        name: 'Formlabs Form 3+',
        type: 'SLA_Drucker',
        status: 'Verfügbar',
        description: "Resin-Drucker für extrem feine Details und glatte Oberflächen.",
        image: "https://shop.formlabs.com/cdn/shop/products/Form3-Main_800x.png",
        volume: '145 × 145 × 185 mm',
        layer: "0.025mm - 0.1mm"
    },

    // --- LASER ---
    {
        id: 'l1',
        name: 'Epilog Fusion Pro 32',
        type: 'Lasercutter',
        status: 'Verfügbar',
        description: "80 Watt CO2 Laser. Schneidet Holz (bis 10mm), Acryl und graviert Glas/Metall.",
        image: "https://www.epiloglaser.com/assets/img/machines/fusion-pro-32/fusion-pro-32-hero.jpg",
        volume: '812 x 508 mm'
    },
    {
        id: 'l2',
        name: 'Trotec Speedy 100',
        type: 'Lasercutter',
        status: 'Defekt',
        description: "Kompakter Laser für Gravuren. Achtung: Laser-Röhre muss getauscht werden.",
        image: "https://www.troteclaser.com/images/Machines/Speedy-100/Speedy-100-hero.jpg",
        volume: '610 x 305 mm'
    },

    // --- CNC ---
    {
        id: 'cnc1',
        name: 'Stepcraft D-Series 840',
        type: 'CNC_Fräse',
        status: 'Wartung',
        description: "Desktop CNC für Holz, Kunststoffe und NE-Metalle (Alu). Fräser bitte selbst mitbringen.",
        image: "https://shop.stepcraft-systems.com/images/product_images/original_images/d-840-construction-kit.jpg",
        volume: '600 x 840 mm'
    },

    // --- PAPIER ---
    {
        id: 'plot1',
        name: 'HP DesignJet T650',
        type: 'Papierdrucker',
        status: 'Verfügbar',
        description: "Großformat-Plotter für CAD-Pläne, Poster und technische Zeichnungen.",
        image: "https://ssl.hp.com/lib/m/de/de/products/printers/designjet-t650/images/designjet-t650-hero.png",
        volume: 'A0, A1, A2, Rollenware'
    }
];

// --- API FUNKTIONEN ---

export function getAllGeraete(): Geraet[] {
    return MOCK_GERAETE;
}

export function getGeraetById(id: string): Geraet | undefined {
    return MOCK_GERAETE.find(geraet => geraet.id === id);
}

// Admin Funktionen
export function addGeraet(geraet: Geraet) {
    MOCK_GERAETE.push(geraet);
}

export function deleteGeraet(id: string) {
    MOCK_GERAETE = MOCK_GERAETE.filter(g => g.id !== id);
}

export function updateGeraetStatus(id: string, newStatus: Geraet['status']) {
    const g = MOCK_GERAETE.find(x => x.id === id);
    if (g) g.status = newStatus;
}