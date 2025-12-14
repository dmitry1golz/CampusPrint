interface PrintBooking {
    id: string;
    printerName: string;
    date: string;
    time: string;
    notes?: string;
    message?: string;
    videoUrl?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'running';
}

interface NewPrintBooking {
    printerId: string;
    date: string;
    time: string;
    notes?: string;
}