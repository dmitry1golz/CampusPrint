import { PrintBooking, NewPrintBooking, Buchungsverfuegbarkeit } from '../models/buchung.js';
import { getGeraetById } from './geraet-service.js';

export let MOCK_BOOKING: PrintBooking[] = [
    {
        id: 'b-new-1',
        printerName: 'Ultimaker S5',
        startDate: new Date(2025, 10, 25, 10, 0),
        endDate: new Date(2025, 10, 25, 14, 0),
        notes: 'Bachelorarbeit Gehäuse V3. Bitte weißes PLA nutzen.',
        status: 'pending'
    },
    {
        id: 'b-new-2',
        printerName: 'Epilog Fusion Pro 32',
        startDate: new Date(2025, 10, 26, 9, 0),
        endDate: new Date(2025, 10, 26, 9, 30),
        notes: 'Architektur-Modell M 1:50, Sperrholz 4mm.',
        status: 'pending'
    },
    {
        id: 'b-new-3',
        printerName: 'HP DesignJet T650',
        startDate: new Date(2025, 10, 26, 11, 0),
        endDate: new Date(2025, 10, 26, 11, 15),
        notes: '3x A0 Pläne für Präsentation.',
        status: 'pending'
    },
    {
        id: 'b-new-4',
        printerName: 'Bambu Lab X1 Carbon',
        startDate: new Date(2025, 10, 27, 8, 0),
        endDate: new Date(2025, 10, 27, 18, 0),
        notes: 'Langer Druck, 4-farbig. Datei liegt auf dem Stick bei.',
        status: 'pending'
    },

    // Active
    {
        id: 'b-active-1',
        printerName: 'Prusa MK4',
        startDate: new Date(2025, 10, 24, 8, 0),
        endDate: new Date(2025, 10, 24, 12, 0),
        notes: 'Ersatzteile für Roboter-AG',
        status: 'running',
        // Dummy URL
        videoUrl: 'https://images.unsplash.com/photo-1629739824696-e13c6d67b2be?q=80&w=1000&auto=format&fit=crop' 
    },
    {
        id: 'b-active-2',
        printerName: 'Formlabs Form 3+',
        startDate: new Date(2025, 10, 24, 13, 0),
        endDate: new Date(2025, 10, 24, 17, 0),
        notes: 'Zahnrad-Prototypen, Tough Resin.',
        status: 'confirmed'
    },
    {
        id: 'b-active-3',
        printerName: 'Stepcraft D-Series 840',
        startDate: new Date(2025, 10, 24, 9, 0),
        endDate: new Date(2025, 10, 24, 15, 0),
        notes: 'Aluminium Frontplatte fräsen.',
        status: 'running'
    },

    // History
    {
        id: 'b-hist-1',
        printerName: 'HP DesignJet T650',
        startDate: new Date(2025, 10, 20, 10, 0),
        endDate: new Date(2025, 10, 20, 10, 30),
        notes: 'Poster A1',
        status: 'completed'
    },
    {
        id: 'b-hist-2',
        printerName: 'Ultimaker S5',
        startDate: new Date(2025, 10, 19, 14, 0),
        endDate: new Date(2025, 10, 19, 18, 0),
        notes: 'Privatprojekt',
        status: 'rejected',
        message: 'Drucken von Waffen-Repliken ist laut Nutzungsordnung untersagt.'
    },
    {
        id: 'b-hist-3',
        printerName: 'Bambu Lab X1 Carbon',
        startDate: new Date(2025, 10, 18, 9, 0),
        endDate: new Date(2025, 10, 18, 11, 0),
        notes: 'Testdruck',
        status: 'completed'
    },
    {
        id: 'b-hist-4',
        printerName: 'Epilog Fusion Pro 32',
        startDate: new Date(2025, 10, 15, 10, 0),
        endDate: new Date(2025, 10, 15, 12, 0),
        notes: 'Geschenk',
        status: 'rejected',
        message: 'Gerät war kurzfristig in Wartung. Bitte neuen Termin buchen.'
    }
];

// API 

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

export function getBuchungsverfuegbarkeitByGeraetId(id: string): Buchungsverfuegbarkeit {
    // While no backend, ID is never checked
    // Static MOCK Data
    return {
        blockedWeekDays: [
            5, 6 // Sa and So blocked (0 Indexed)
        ],
        fullyBookedDays: [
            new Date(2025, 11, 16),
            new Date(2025, 11, 17),
        ],
        partialyBookedDays: [
            new Date(2025, 11, 18),
            new Date(2025, 11, 22),
            new Date(2026, 0, 13),
        ]
    };
}