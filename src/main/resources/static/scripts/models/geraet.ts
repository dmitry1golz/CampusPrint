export interface Geraet {
    id: string;
    name: string;
    description: string;
    image: string;
    
    // Alle von dir geforderten Typen
    type: 'FDM_Drucker' | 'SLA_Drucker' | 'Lasercutter' | 'CNC_Fräse' | 'Papierdrucker';
    
    status: 'Verfügbar' | 'Wartung' | 'Defekt';

    // Optionale Felder (da ein Papierdrucker keine Nozzle hat)
    // Wir nutzen 'volume' auch als 'Format' (z.B. A4) bei Papierdruckern
    volume?: string; 
    
    // Spezifisch für 3D Druck
    layer?: string;
    nozzle?: string;
}

// Helper: Prüft ob es ein 3D Drucker ist (für UI Logik)
export function is3DPrinter(geraet: Geraet): boolean {
    return geraet.type === 'FDM_Drucker' || geraet.type === 'SLA_Drucker';
}