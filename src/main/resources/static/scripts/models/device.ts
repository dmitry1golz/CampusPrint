// 1. Status: Passt jetzt zum erweiterten Java-Enum
export type DeviceStatus = 'Available' | 'Unavailable';

// 2. Typen: Passend zum Java-Enum DeviceType
export type DeviceTyp = 'FDM_Printer' | 'SLA_Printer' | 'Laser_Cutter' | 'Printer';

// --- Options-Strukturen (Admin definiert diese im Backend) ---

export interface Dimensions2D {
    x: number;
    y: number;
}

export interface Dimensions3D {
    x: number;
    y: number;
    z: number;
}

export interface FdmMaterial {
    name: string;
    temp_nozzle: number;
    temp_bed: number;
    color_hex: string;
}

export interface SlaMaterial {
    name: string;
    color_hex: string;
}

export interface LaserPreset {
    material: string;
    thickness: number;
    power: number;
    speed: number;
}

export interface FdmOptions {
    tech_type: 'FDM';
    work_area: Dimensions3D;
    available_materials: FdmMaterial[];
    supported_layer_heights: number[];
    nozzle_sizes: number[];
}

export interface SlaOptions {
    tech_type: 'SLA';
    work_area: Dimensions3D;
    available_materials: SlaMaterial[];
    supported_layer_heights: number[];
}

export interface LaserOptions {
    tech_type: 'LASER';
    work_area: Dimensions2D;
    presets: LaserPreset[];
}

// Other 3D options -> TODO in Booking settings beachten
// infill_percent: number;                
// supports: 'none' | 'touching_bed' | 'everywhere' | 'auto'; 
// adhesion: boolean;

export interface PaperOptions {
    tech_type: 'PAPER';
    paper_weights: number[];
    formats: string[];
}



// --- Haupt-Interfaces für die Geräte ---

interface BaseDevice {
    id: string; // Backend sendet String
    name: string;
    description: string;
    model?: string;
    type: DeviceTyp;
    status: DeviceStatus;
    // Options done with base class extensions
    image: string;
    bookingAvailabilityBlockedWeekdays: number[];
}

// Discriminated Unions für Typ-Sicherheit

export interface FDMPrinter extends BaseDevice {
    type: 'FDM_Printer';
    print_options: FdmOptions;
}

export interface SLAPrinter extends BaseDevice {
    type: 'SLA_Printer';
    print_options: SlaOptions;
}

export interface LaserCutter extends BaseDevice {
    type: 'Laser_Cutter';
    print_options: LaserOptions;
}

export interface PaperPrinter extends BaseDevice {
    type: 'Printer'; 
    print_options: PaperOptions;
}

// Der finale Typ für die Verwendung im Code
export type Device = FDMPrinter | SLAPrinter | LaserCutter | PaperPrinter;