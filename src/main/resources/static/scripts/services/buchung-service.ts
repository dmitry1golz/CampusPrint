// WICHTIG: Import der Models und des Geraet-Service
import { PrintBooking, NewPrintBooking } from '../models/buchung.js';
import { getGeraetById } from './geraet-service.js';

// MOCK DATEN
export let MOCK_BOOKING: PrintBooking[] = [
    // --- PENDING (Ausstehend) ---
    {
        id: 'b-new-1',
        printerName: 'Ultimaker S5',
        startDate: '25.11.2025 10:00',
        endDate: '25.11.2025 14:00',
        notes: 'Bachelorarbeit Gehäuse V3. Bitte weißes PLA nutzen.',
        status: 'pending'
    },
    {
        id: 'b-new-2',
        printerName: 'Epilog Fusion Pro 32',
        startDate: '26.11.2025 09:00',
        endDate: '26.11.2025 09:30',
        notes: 'Architektur-Modell M 1:50, Sperrholz 4mm.',
        status: 'pending'
    },
    {
        id: 'b-new-3',
        printerName: 'HP DesignJet T650',
        startDate: '26.11.2025 11:00',
        endDate: '26.11.2025 11:15',
        notes: '3x A0 Pläne für Präsentation.',
        status: 'pending'
    },
    {
        id: 'b-new-4',
        printerName: 'Bambu Lab X1 Carbon',
        startDate: '27.11.2025 08:00',
        endDate: '27.11.2025 18:00',
        notes: 'Langer Druck, 4-farbig. Datei liegt auf dem Stick bei.',
        status: 'pending'
    },

    // --- ACTIVE / CONFIRMED (Aktiv) ---
    {
        id: 'b-active-1',
        printerName: 'Prusa MK4',
        startDate: '24.11.2025 08:00',
        endDate: '24.11.2025 12:00',
        notes: 'Ersatzteile für Roboter-AG',
        status: 'running',
        // Hier ein Test-Video (Dummy URL, wird nicht wirklich laden, aber das Icon zeigen)
        videoUrl: 'https://images.unsplash.com/photo-1629739824696-e13c6d67b2be?q=80&w=1000&auto=format&fit=crop' 
    },
    {
        id: 'b-active-2',
        printerName: 'Formlabs Form 3+',
        startDate: '24.11.2025 13:00',
        endDate: '24.11.2025 17:00',
        notes: 'Zahnrad-Prototypen, Tough Resin.',
        status: 'confirmed'
    },
    {
        id: 'b-active-3',
        printerName: 'Stepcraft D-Series 840',
        startDate: '24.11.2025 09:00',
        endDate: '24.11.2025 15:00',
        notes: 'Aluminium Frontplatte fräsen.',
        status: 'running'
    },

    // --- HISTORY (Historie) ---
    {
        id: 'b-hist-1',
        printerName: 'HP DesignJet T650',
        startDate: '20.11.2025 10:00',
        endDate: '20.11.2025 10:30',
        notes: 'Poster A1',
        status: 'completed'
    },
    {
        id: 'b-hist-2',
        printerName: 'Ultimaker S5',
        startDate: '19.11.2025 14:00',
        endDate: '19.11.2025 18:00',
        notes: 'Privatprojekt',
        status: 'rejected',
        message: 'Drucken von Waffen-Repliken ist laut Nutzungsordnung untersagt.'
    },
    {
        id: 'b-hist-3',
        printerName: 'Bambu Lab X1 Carbon',
        startDate: '18.11.2025 09:00',
        endDate: '18.11.2025 11:00',
        notes: 'Testdruck',
        status: 'completed'
    },
    {
        id: 'b-hist-4',
        printerName: 'Epilog Fusion Pro 32',
        startDate: '15.11.2025 10:00',
        endDate: '15.11.2025 12:00',
        notes: 'Geschenk',
        status: 'rejected',
        message: 'Gerät war kurzfristig in Wartung. Bitte neuen Termin buchen.'
    }
];

// --- API FUNKTIONEN ---

export function getAllBookings(): PrintBooking[] {
    return MOCK_BOOKING;
}

export function getBookingsForEmail(email: string): PrintBooking[] {
    return MOCK_BOOKING;
}

export function updateBookingStatus(id: string, newStatus: PrintBooking['status'], message?: string) {
    const b = MOCK_BOOKING.find(x => x.id === id);
    if (b) {
        b.status = newStatus;
        if(message) b.message = message;
    }
}

// Die Funktion, die in buchung.ts gefehlt hat:
export function createNewBooking(newBooking: NewPrintBooking) {
    const printer = getGeraetById(newBooking.printerId);
    
    const booking: PrintBooking = {
        id: `book-${Date.now()}`,
        printerName: printer ? printer.name : 'Unbekannt',
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        notes: newBooking.notes,
        status: 'pending'
    };
    MOCK_BOOKING.push(booking);
    console.log("Buchung angelegt:", booking);
}