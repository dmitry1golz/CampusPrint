// Exportiert für alle anderen Dateien
export interface PrintBooking {
    id: string;
    printerName: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
    message?: string;   // Admin: Ablehnungsgrund
    videoUrl?: string;
    
    // Alle Status-Optionen kombiniert
    status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'running';
}

export interface NewPrintBooking {
    printerId: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
}

export interface Buchungsverfuegbarkeit {
    blockedWeekDays: number[];
    fullyBookedDays: Date[];
    partialyBookedDays: Date[];
}