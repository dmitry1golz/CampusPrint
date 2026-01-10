import { FdmMaterial, LaserPreset, SlaMaterial } from "./device";

// Export Bookinginterface
export interface Booking {
    id: string;
    printerName: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
    message?: string;   // Admin: reason for rejection
    videoUrl?: string;
    
    // All status info combined
    status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'running';
}

export type SupportType = 'none' | 'touching_bed' | 'everywhere' | 'auto';
export const supportOptions = ['none', 'touching_bed', 'everywhere', 'auto'];

export interface SelectedFdmOptions {
    tech_type: 'FDM';
    selected_material: FdmMaterial;
    selected_layer_height: number;
    selected_nozzle_size: number;
    selected_support_type: SupportType;
    selected_infill_percentage: number;
}

export interface SelectedSlaOptions {
    tech_type: 'SLA';
    selected_material: SlaMaterial;
    selected_layer_height: number;
    selected_support_type: SupportType;
    selected_infill_percentage: number;
}

export interface SelectedLaserOptions {
    tech_type: 'LASER';
    selected_preset: LaserPreset;
}

export interface SelectedPaperOptions {
    tech_type: 'PAPER';
    selected_paper_weights: number;
    selected_format: string;
}

export interface BaseNewBooking {
    printerId: String;
    userEmail: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
}

export interface NewFDMPrinterBooking extends BaseNewBooking {
    type: 'FDM_Printer';
    print_options: SelectedFdmOptions;
}

export interface NewSLAPrinterBooking extends BaseNewBooking {
    type: 'SLA_Printer';
    print_options: SelectedSlaOptions;
}

export interface NewLaserCutterBooking extends BaseNewBooking {
    type: 'Laser_Cutter';
    print_options: SelectedLaserOptions;
}

export interface NewPaperPrinterBooking extends BaseNewBooking {
    type: 'Printer'; 
    print_options: SelectedPaperOptions;
}

export type NewBooking = NewFDMPrinterBooking | NewSLAPrinterBooking | NewLaserCutterBooking | NewPaperPrinterBooking;

export interface BookingAvailability {
    blockedWeekDays: number[];
    fullyBookedDays: Date[];
    partialyBookedDays: Date[];
}