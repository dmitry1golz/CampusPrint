export interface Geraet {
    id: string;
    name: string;
    description: string;
    image: string;

    type: 'FDM_Drucker' | 'SLA_Drucker' | 'Lasercutter' | 'CNC_Fräse' | 'Papierdrucker';
    status: 'Verfügbar' | 'Wartung' | 'Defekt';

    // Optional fields, needs work
    // volume shall be changed to: size x * size z * size y 
    volume?: string; 
    layer?: string;
    nozzle?: string;
}


export interface ThreeDPrinter extends Geraet {
    type: 'FDM_Drucker' | 'SLA_Drucker';
}

// Helper für Admin Panel
export function is3DPrinter(geraet: Geraet): boolean {
    return geraet.type === 'FDM_Drucker' || geraet.type === 'SLA_Drucker';
}