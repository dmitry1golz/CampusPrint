import { Geraet } from '../models/geraet.js';

// Stelle sicher, dass der Port stimmt (8090 bei dir)
const API_URL = 'http://localhost:8090/api/devices';

export async function getAllGeraete(): Promise<Geraet[]> {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Server Fehler: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Laden der Geräte:", error);
        return [];
    }
}

export async function getGeraetById(id: string): Promise<Geraet | undefined> {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            return undefined;
        }
        return await response.json();
    } catch (error) {
        console.error(`Fehler beim Laden von Gerät ${id}:`, error);
        return undefined;
    }
}

// Admin Funktionen (vorerst Dummy oder API-Call)
export async function addGeraet(geraet: Geraet): Promise<void> {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geraet)
    });
}

export async function deleteGeraet(id: string): Promise<void> {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
}

// TODO: Backend muss diesen Endpoint erst noch bereitstellen
export async function updateGeraetStatus(id: string, status: any): Promise<void> {
    console.log("Status Update TODO:", id, status);
}