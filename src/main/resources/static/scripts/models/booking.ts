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

export interface NewBooking {
    printerId: String;
    userEmail: string;
    startDate: Date;
    endDate: Date;
    notes?: string;
}

export interface BookingAvailability {
    blockedWeekDays: number[];
    fullyBookedDays: Date[];
    partialyBookedDays: Date[];
}