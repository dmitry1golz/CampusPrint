import { Geraet } from '../models/geraet.js';

// Das hier später durch fetch('/api/devices') ersetzen
let CACHE: Geraet[] = []; 

export async function getAllGeraete(): Promise<Geraet[]> {
    // Falls wir noch keine Daten haben, geben wir ein leeres Array zurück 
    // oder mocken kurz, damit du was siehst:
    if (CACHE.length === 0) {
        // Hier könnte dein Mock-Array stehen, wenn du willst.
        // Für jetzt leer:
        return [];
    }
    return CACHE;
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