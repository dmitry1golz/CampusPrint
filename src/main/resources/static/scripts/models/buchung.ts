interface PrintBooking {
    id: string;
    printerName: string;
    startDate: string;
    endDate: string;
    notes?: string;
    message?: string;
    videoUrl?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'running';
}

interface NewPrintBooking {
    printerId: string;
    startDate: string;
    endDate: string;
    notes?: string;
}