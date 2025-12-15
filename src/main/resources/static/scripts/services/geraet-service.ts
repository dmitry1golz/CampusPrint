import { Geraet } from '../models/geraet.js';

// --- MOCK DATEN ---
export let MOCK_GERAETE: Geraet[] = [
    {
        id: 'p1',
        name: 'Ultimaker S5',
        type: 'FDM_Drucker',
        status: 'Verfügbar',
        description: "Professioneller Dual-Extrusion Drucker für komplexe Geometrien.",
        image: "https://ultimaker.com/wp-content/uploads/2023/05/The_Ultimaker_S5.jpg",
        volume: '330 x 240 x 300 mm',
        nozzle: "0.4mm AA",
        layer: "0.15mm"
    },
    {
        id: 'l1',
        name: 'Epilog Fusion Pro',
        type: 'Lasercutter',
        status: 'Wartung',
        description: "High-Speed CO2 Laser für Holz, Acryl und Gravuren.",
        image: "https://www.epiloglaser.com/assets/img/machines/fusion-pro-32/fusion-pro-32-hero.jpg",
        volume: '812 x 508 mm'
    },
    {
        id: 'cnc1',
        name: 'Stepcraft D-Series',
        type: 'CNC_Fräse',
        status: 'Verfügbar',
        description: "Desktop CNC Fräse für Aluminium und Hölzer.",
        image: "",
        volume: '420 x 600 mm'
    },
    {
        id: 'paper1',
        name: 'Canon imageRUNNER',
        type: 'Papierdrucker',
        status: 'Verfügbar',
        description: "A3/A4 Farbdrucker für Poster und Skripte. Bitte eigenes Papier mitbringen.",
        image: "",
        volume: "A3, A4, A5, Briefumschläge"
    }
];

// --- API FUNKTIONEN ---

export function getAllGeraete(): Geraet[] {
    return MOCK_GERAETE;
}

export function getGeraetById(id: string): Geraet | undefined {
    return MOCK_GERAETE.find(geraet => geraet.id === id);
}

export function addGeraet(geraet: Geraet) {
    MOCK_GERAETE.unshift(geraet);
}

export function deleteGeraet(id: string) {
    MOCK_GERAETE = MOCK_GERAETE.filter(g => g.id !== id);
}

export function updateGeraetStatus(id: string, newStatus: Geraet['status']) {
    const g = MOCK_GERAETE.find(x => x.id === id);
    if (g) {
        g.status = newStatus;
    }
}