import { getGeraetById } from './geraet-service.js';

// Temporary Local Data while frontend only
var MOCK_BOOKING: PrintBooking[] = [
    {
        id: 'book-1763276488435',
        printerName: 'Ultimaker S5',
        startDate: new Date(2025, 10, 21, 13, 0),
        endDate: new Date(2025, 10, 21, 19, 0),
        notes: 'Prototypen',
        status: 'rejected',
        message: "Der Zeitslot ist leider nicht verfügbar. Ich könnte dir anbieren, den Druck am 25.11.2025 " +
            "durchzuführen. Sonst melde dich unter admin@campusprint.de, damit wir einen Termin finden."
    },
    {
        id: 'book-1763276489000',
        printerName: 'Prusa MK3',
        startDate: new Date(2025, 10, 22, 9, 0),
        endDate: new Date(2025, 10, 22, 12, 0),
        notes: 'Testdruck',
        videoUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.schaan.li%2Fapplication' +
            '%2Ffiles%2Fthumbnails%2Flarge%2F9116%2F5174%2F4032%2F3D-Druck.jpg',
        status: 'running'
    },
    {
        id: 'book-1763276490123',
        printerName: 'Ender 3',
        startDate: new Date(2025, 10, 23, 8, 0),
        endDate: new Date(2025, 10, 24, 14, 0),
        notes: 'Miniatur-Serie',
        status: 'pending'
    },
    {
        id: 'book-1763276491456',
        printerName: 'Formlabs Form 3',
        startDate: new Date(2025, 10, 24, 10, 0),
        endDate: new Date(2025, 10, 24, 16, 0),
        notes: 'Gehäuse Prototyp',
        status: 'confirmed'
    },
    {
        id: 'book-1763276493012',
        printerName: 'Anycubic Photon',
        startDate: new Date(2025, 10, 20, 7, 0),
        endDate: new Date(2025, 10, 20, 13, 0),
        notes: 'Kleinteile Batch',
        status: 'completed'
    },
];

export function getBookingsForEmail(email: string): PrintBooking[] {
    // Currently all Bookings are for all users -> No DB backend that handles user relations
    return MOCK_BOOKING;
}

var counter = 0;
export function createNewBooking(newBooking: NewPrintBooking) {
    const booking: PrintBooking = {
        id: counter.toString(),
        printerName: getGeraetById(newBooking.printerId)!.name,
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        notes: newBooking.notes,
        status: 'pending'
    }
    MOCK_BOOKING.push(booking);
    counter++;
}

export function getBuchungsverfuegbarkeitByGeraetId(id: string): Buchungsverfuegbarkeit {
    // While no backend, ID is never checked
    // Static MOCK Data
    return {
        blockedWeekDays: [
            5, 6 // Sa und So geblockt (0 Indexed)
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