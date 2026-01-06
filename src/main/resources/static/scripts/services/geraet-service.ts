import { Geraet, GeraeteStatus } from '../models/geraet.js';

const API_URL = 'http://localhost:8090/api/devices';

export async function getAllGeraete(): Promise<Geraet[]> {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Laden:", error);
        return [];
    }
}

export async function getGeraetById(id: number): Promise<Geraet | undefined> {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) return undefined;
        return await response.json();
    } catch (error) {
        return undefined;
    }
}

// Erstellen ODER Update (da Spring Boot .save() für beides nutzt)
export async function addGeraet(geraet: Geraet): Promise<void> {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geraet)
    });
}

export async function deleteGeraet(id: number): Promise<void> {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
}

// Status ändern: Wir laden das Gerät, ändern den Status, speichern es.
export async function updateGeraetStatus(id: number, newStatus: GeraeteStatus): Promise<void> {
    const device = await getGeraetById(id);
    if (device) {
        device.status = newStatus;
        await addGeraet(device);
    }
}