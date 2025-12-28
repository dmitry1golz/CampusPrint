// 1. Status: Passt jetzt zum erweiterten Java-Enum
export type GeraeteStatus = 'Available' | 'Maintenance' | 'Defect' | 'InUse';

// 2. Typen: Passend zum Java-Enum DeviceType
export type GeraeteTyp = 'FDM_Printer' | 'SLA_Printer' | 'Laser_Cutter' | 'CNC_Mill' | 'Printer';

// --- Options-Strukturen (Admin definiert diese im Backend) ---

export interface MaterialProfile {
    name: string;          // e.g PLA
    temp_nozzle: number;   // auto set
    temp_bed: number;      // auto set
    color_hex?: string;    
}

export interface ThreeDOptions {
    dimensions: { x: number; y: number; z: number };
    available_materials: MaterialProfile[];
    supported_layer_heights: number[];
    nozzle_sizes: number[];
}

export interface LaserOptions {
    work_area: { x: number; y: number };
    presets: { material: string; thickness: number; power: number; speed: number }[];
}

export interface PaperOptions {
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

interface BaseGeraet {
    id: number; // Backend sendet Integer
    name: string;
    description: string;
    image: string;
    status: GeraeteStatus; // Hier ist jetzt auch 'Maintenance' erlaubt
    model?: string;
}

// Discriminated Unions für Typ-Sicherheit

export interface FDMPrinter extends BaseGeraet {
    type: 'FDM_Printer';
    print_options: ThreeDOptions;
}

export interface SLAPrinter extends BaseGeraet {
    type: 'SLA_Printer';
    print_options: ThreeDOptions;
}

export interface LaserCutter extends BaseGeraet {
    type: 'Laser_Cutter';
    print_options: LaserOptions;
}

export interface CNCMill extends BaseGeraet {
    type: 'CNC_Mill';
    print_options: LaserOptions; 
}

export interface PaperPrinter extends BaseGeraet {
    type: 'Printer'; 
    print_options: PaperOptions;
}

// Der finale Typ für die Verwendung im Code
export type Geraet = FDMPrinter | SLAPrinter | LaserCutter | CNCMill | PaperPrinter;