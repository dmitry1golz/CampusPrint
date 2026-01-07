// 1. Status: Passt jetzt zum erweiterten Java-Enum
export type DeviceStatus = 'Available' | 'Unavailable';

// 2. Typen: Passend zum Java-Enum DeviceType
export type DeviceTyp = 'FDM_Printer' | 'SLA_Printer' | 'Laser_Cutter' | 'CNC_Mill' | 'Printer';

// --- Options-Strukturen (Admin definiert diese im Backend) ---

export interface MaterialProfile {
    name: string;
    temp_nozzle: number;
    temp_bed: number;
    color_hex?: string;
}

// FDM & SLA teilen sich viele Felder, aber wir unterscheiden sie sauber
export interface ThreeDOptions {
    tech_type: 'FDM' | 'SLA'; // <--- NEU: Das kommt jetzt aus dem Backend JSON
    dimensions: { x: number; y: number; z: number };
    available_materials: MaterialProfile[]; // oder ResinProfile
    supported_layer_heights: number[];
    nozzle_sizes?: number[]; // Optional, da SLA das nicht hat
}

export interface LaserOptions {
    tech_type: 'LASER'; // <--- NEU
    work_area: { x: number; y: number };
    presets: { material: string; thickness: number; power: number; speed: number }[];
}

export interface PaperOptions {
    tech_type: 'PAPER'; // <--- NEU
    paper_weights: number[];
    formats: string[];
}

// --- User Choices (Das wird später beim Buchen gespeichert) ---

export interface ThreeDJobSettings {
    selected_material: string;             
    layer_height: number;                  
    infill_percent: number;                
    supports: 'none' | 'touching_bed' | 'everywhere' | 'auto'; 
    adhesion: boolean;                     
}

// --- Haupt-Interfaces für die Geräte ---

interface BaseDevice {
    id: number; // Backend sendet Integer
    name: string;
    description: string;
    image: string;
    status: DeviceStatus;
    model?: string;
    print_options?: ThreeDOptions | LaserOptions | PaperOptions;
    bookingAvailabilityBlockedWeekdays: number[];
}

// Discriminated Unions für Typ-Sicherheit

export interface FDMPrinter extends BaseDevice {
    type: 'FDM_Printer';
    print_options: ThreeDOptions;
}

export interface SLAPrinter extends BaseDevice {
    type: 'SLA_Printer';
    print_options: ThreeDOptions;
}

export interface LaserCutter extends BaseDevice {
    type: 'Laser_Cutter';
    print_options: LaserOptions;
}

export interface CNCMill extends BaseDevice {
    type: 'CNC_Mill';
    print_options: LaserOptions; 
}

export interface PaperPrinter extends BaseDevice {
    type: 'Printer'; 
    print_options: PaperOptions;
}

// Der finale Typ für die Verwendung im Code
export type Device = FDMPrinter | SLAPrinter | LaserCutter | CNCMill | PaperPrinter;