import { Device, DeviceStatus } from '../models/device.js';
import { getAuthHeaders, requireAuth } from './authService.js';

const API_URL = '/api/devices';

export async function getAllDevices(): Promise<Device[]> {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Fehler beim Laden:", error);
        return [];
    }
}

export async function getDeviceById(id: string): Promise<Device | undefined> {
    try {
        const response = await fetch(`${API_URL}/${id}`);
        if (!response.ok) return undefined;
        return await response.json();
    } catch (error) {
        return undefined;
    }
}

// Erstellen ODER Update (da Spring Boot .save() für beides nutzt)
export async function addDevice(device: Device): Promise<void> {
    requireAuth();
    await fetch(API_URL, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(device)
    });
}

export async function deleteDevice(id: string): Promise<void> {
    requireAuth();
    await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        ...getAuthHeaders()
    });
}

// Status ändern: Wir laden das Gerät, ändern den Status, speichern es.
export async function updateDeviceStatus(id: string, newStatus: DeviceStatus): Promise<void> {
    requireAuth();
    const device = await getDeviceById(id);
    if (device) {
        device.status = newStatus;
        await addDevice(device);
    }
}