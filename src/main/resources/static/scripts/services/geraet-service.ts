import { Geraet } from '../models/geraet.js';

// Das hier später durch fetch('/api/devices') ersetzen
// TEMP: Hardcoded mock data so we can test the UI without backend
let CACHE: Geraet[] = [
    {
        id: 'p1',
        name: 'Ultimaker S5',
        type: 'FDM_Drucker',
        status: 'Verfügbar',
        description: "Professional Dual-Extrusion Printer.",
        image: "https://ultimaker.com/wp-content/uploads/2023/05/The_Ultimaker_S5.jpg",
        print_options: {
             dimensions: { x: 330, y: 240, z: 300 },
             available_materials: [],
             supported_layer_heights: [0.1, 0.2],
             nozzle_sizes: [0.4]
        }
    },
    // ... add more if needed
];

export async function getAllGeraete(): Promise<Geraet[]> {
    // later: const res = await fetch('/api/devices'); return await res.json();
    return CACHE;
}

export async function getGeraetById(id: string): Promise<Geraet | undefined> {
    const all = await getAllGeraete();
    return all.find(g => g.id === id);
}

// Die Funktionen, die gefehlt haben:
export async function addGeraet(geraet: Geraet): Promise<void> {
    CACHE.push(geraet);
    console.log("Device added (simulated):", geraet);
    // Später: await fetch('/api/devices', { method: 'POST', body: JSON.stringify(geraet) ... });
}

export async function deleteGeraet(id: string): Promise<void> {
    CACHE = CACHE.filter(g => g.id !== id);
    console.log("Device deleted (simulated):", id);
    // Später: await fetch(`/api/devices/${id}`, { method: 'DELETE' });
}

export async function updateGeraetStatus(id: string, status: Geraet['status']): Promise<void> {
    const g = CACHE.find(dev => dev.id === id);
    if (g) g.status = status;
    console.log("Status updated (simulated):", id, status);
    // Später: await fetch(...)
}

