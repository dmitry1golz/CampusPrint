interface PrintBooking {
    id: string;
    printerName: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
    message?: string;
    videoUrl?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'running';
}

interface NewPrintBooking {
    printerId: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
}

interface Buchungsverfuegbarkeit {
    blockedWeekDays: number[];
    fullyBookedDays: Date[];
    partialyBookedDays: Date[];
}