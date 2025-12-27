// Material, Admin defined, User only choosing color and material
export interface MaterialProfile {
    name: string;          // e.g PLA
    temp_nozzle: number;   // auto set, not available for user
    temp_bed: number;      // auto set, not available for user
    color_hex?: string;    // user only choosing color
}

// Admin space
export interface ThreeDOptions {
    dimensions: { x: number; y: number; z: number };
    available_materials: MaterialProfile[]; // Temp data
    supported_layer_heights: number[];      // e.g [0.1, 0.15, 0.2]
    nozzle_sizes: number[];                 // e.g [0.4, 0.6]
}

// User choices (Buchungs-Bereich)
// this is gonna be written to settings JSON in print_jobs
export interface ThreeDJobSettings {
    selected_material: string;             // User only choosing material
    layer_height: number;                  // choices as list
    infill_percent: number;                // slider 0-100
    supports: 'none' | 'touching_bed' | 'everywhere' | 'auto'; // supports
    adhesion: boolean;                     // yes/no for brim, raft
}

// Main interface
export interface Geraet {
    id: string;
    name: string;
    description: string;
    image: string;
    type: 'FDM_Drucker' | 'SLA_Drucker' | 'Lasercutter' | 'Papierdrucker';
    status: 'Verfügbar' | 'Wartung' | 'Defekt';

    // devices.print_options
    print_options: ThreeDOptions | LaserOptions | PaperOptions;
}

// spaceholder for other types - similar logic
export interface LaserOptions {
    work_area: { x: number; y: number };
    presets: { material: string; thickness: number; power: number; speed: number }[];
}

export interface PaperOptions {
    paper_weights: number[]; // [80, 100, 200]
    formats: string[];       // ["A4", "A3"]
}