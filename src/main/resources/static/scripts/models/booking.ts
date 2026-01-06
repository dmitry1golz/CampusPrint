// Export Bookinginterface
export interface PrintBooking {
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

export interface NewPrintBooking {
    printerId: number;
    startDate: Date;
    endDate: Date;
    notes?: string;
}

export interface Buchungsverfuegbarkeit {
    blockedWeekDays: number[];
    fullyBookedDays: Date[];
    partialyBookedDays: Date[];
}