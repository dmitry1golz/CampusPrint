import { Geraet } from '../models/geraet.js';

// Passe den Port an, falls du in application.properties etwas anderes als 8090 hast
const API_URL = 'http://localhost:8090/api/devices';

export async function getAllGeraete(): Promise<Geraet[]> {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Could not fetch devices:", error);
        return [];
    }
}

export async function getGeraetById(id: string): Promise<Geraet | undefined> {
    try {
        // ID an URL anhängen
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) {
            return undefined;
        }
        return await response.json();
    } catch (error) {
        console.error(`Could not fetch device ${id}:`, error);
        return undefined;
    }
}

// Für Admin später:
export async function addGeraet(geraet: Geraet): Promise<void> {
    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geraet)
    });
}

// Dummys für die anderen Funktionen, damit Admin nicht crasht (implementieren wir später richtig)
export async function deleteGeraet(id: string): Promise<void> { console.log("Delete TODO via API"); }
export async function updateGeraetStatus(id: string, status: any): Promise<void> { console.log("Update Status TODO via API"); }