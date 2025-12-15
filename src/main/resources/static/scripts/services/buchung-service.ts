import { PrintBooking } from '../models/buchungs.js';

// --- MOCK DATEN ---
export let MOCK_BOOKING: PrintBooking[] = [
    {
        id: 'b-101',
        printerName: 'Ultimaker S5',
        startDate: '21.11.2025 13:00',
        endDate: '21.11.2025 19:00',
        notes: 'Gehäuse für Arduino Projekt',
        status: 'pending' // Wartet auf Bestätigung
    },
    {
        id: 'b-102',
        printerName: 'Epilog Fusion Pro',
        startDate: '22.11.2025 09:00',
        endDate: '22.11.2025 10:00',
        notes: 'Acryl Platten schneiden (Material vorhanden)',
        status: 'confirmed' // Bereit zum Starten
    },
    {
        id: 'b-103',
        printerName: 'Canon imageRUNNER',
        startDate: '22.11.2025 11:00',
        endDate: '22.11.2025 11:15',
        notes: '50x Flyer A4',
        status: 'running' // Wird gerade gedruckt
    },
    {
        id: 'b-104',
        printerName: 'Ultimaker S5',
        startDate: '20.11.2025 08:00',
        endDate: '20.11.2025 12:00',
        status: 'rejected',
        message: 'Zeitfenster leider wegen Wartung nicht verfügbar.'
    }
];

// --- API FUNKTIONEN ---

export function getAllBookings(): PrintBooking[] {
    return MOCK_BOOKING;
}

export function getBookingsForEmail(email: string): PrintBooking[] {
    // Später: Filtern nach User Email
    return MOCK_BOOKING;
}

export function updateBookingStatus(id: string, newStatus: PrintBooking['status'], rejectionReason?: string) {
    const booking = MOCK_BOOKING.find(b => b.id === id);
    if (booking) {
        booking.status = newStatus;
        
        // Falls abgelehnt wurde, speichern wir den Grund
        if (newStatus === 'rejected' && rejectionReason) {
            booking.message = rejectionReason;
        }
    }
}