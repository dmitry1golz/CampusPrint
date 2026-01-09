import {Booking, BookingAvailability, NewBooking} from '../models/booking.js';
import {Device} from '../models/device.js';

const API_URL = 'http://localhost:8090/api/bookings';

export let MOCK_BOOKING: Booking[] = [
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
    // ... restliche Mocks ...
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

// API Functions

// Returns sync array because admin.ts expects direct array (for now)
export function getAllBookings(): Booking[] {
    return MOCK_BOOKING;
}

export async function getBookingsForEmail(email: string): Promise<Booking[] | undefined> {
    const response = await fetch(`${API_URL}?email=${email}`);
    if (!response.ok) return undefined;

    const rawBookings = await response.json();
    return rawBookings.map((b: any) => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
    }));
}

// CHANGED TO ASYNC: This fixes the 'Property then does not exist' error in admin.ts
export async function updateBookingStatus(id: string, newStatus: Booking['status'], message?: string): Promise<void> {
    const b = MOCK_BOOKING.find(x => x.id === id);
    if (b) {
        b.status = newStatus;
        if(message) b.message = message;
    }
    // Simulate network delay if you want
    // await new Promise(r => setTimeout(r, 100));
}

export async function createNewBooking(newBooking: NewBooking): Promise<Booking | undefined> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBooking)
    });
    if (!response.ok) return undefined;
    return await response.json();
}

export async function getBookingAvailabilityForDevice(device: Device): Promise<BookingAvailability | undefined> {
    const response = await fetch(`${API_URL}?deviceId=${device.id}&futureOnly=true`);
    if (!response.ok) return undefined;
    const rawBookings = await response.json();
    const bookings: Booking[] = rawBookings.map((b: any) => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
    }));
    const congestedDays = calculateDailyCongestion(bookings);
    return {
        blockedWeekDays: device.bookingAvailabilityBlockedWeekdays ?? [],
        fullyBookedDays: congestedDays.over12Hours,
        partialyBookedDays: congestedDays.under12Hours,
    };
}

type CongestionResult = {
    over12Hours: Date[];  // local date objects (midnight)
    under12Hours: Date[]; // local date objects (midnight)
};

function calculateDailyCongestion(bookings: Booking[]): CongestionResult {
    // Map: local-day (ms since epoch at local midnight) -> total milliseconds booked
    const perDay: Map<number, number> = new Map();

    for (const booking of bookings) {
        if (!booking.startDate || !booking.endDate) continue;

        let startUtc = new Date(booking.startDate);
        let endUtc = new Date(booking.endDate);

        // Convert to local time instants (Dates always represent UTC internally;
        // "local" means how we slice by local calendar days).
        const startLocal = new Date(startUtc.getTime());
        const endLocal = new Date(endUtc.getTime());

        // Walk day-by-day in local time
        let current = new Date(
            startLocal.getFullYear(),
            startLocal.getMonth(),
            startLocal.getDate(),
            0, 0, 0, 0
        );

        // Iterate while booking overlaps this day
        while (current <= endLocal) {
            const dayStart = new Date(
                current.getFullYear(),
                current.getMonth(),
                current.getDate(),
                0, 0, 0, 0
            );

            const dayEnd = new Date(
                current.getFullYear(),
                current.getMonth(),
                current.getDate(),
                23, 59, 59, 999
            );

            // overlap within this day
            const overlapStart = new Date(Math.max(dayStart.getTime(), startLocal.getTime()));
            const overlapEnd = new Date(Math.min(dayEnd.getTime(), endLocal.getTime()));

            if (overlapEnd > overlapStart) {
                const ms = overlapEnd.getTime() - overlapStart.getTime();
                const key = dayStart.getTime(); // local-midnight identifier

                perDay.set(key, (perDay.get(key) ?? 0) + ms);
            }

            // move to next day
            current.setDate(current.getDate() + 1);
        }
    }

    // Split into ≥ 12h vs < 12h
    const twelveHoursMs = 12 * 60 * 60 * 1000;

    const over12Hours: Date[] = [];
    const under12Hours: Date[] = [];

    for (const [midnightMs, totalMs] of perDay.entries()) {
        const date = new Date(midnightMs); // local midnight date
        if (totalMs >= twelveHoursMs) over12Hours.push(date);
        else under12Hours.push(date);
    }

    // Optional: sort results chronologically
    over12Hours.sort((a, b) => a.getTime() - b.getTime());
    under12Hours.sort((a, b) => a.getTime() - b.getTime());

    return { over12Hours, under12Hours };
}