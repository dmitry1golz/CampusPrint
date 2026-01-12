import {Booking, BookingAvailability, NewBooking} from '../models/booking.js';
import {Device} from '../models/device.js';
import { getAuthHeaders } from './authService.js';

const API_URL = '/api/bookings';

// API Functions

// Returns sync array because admin.ts expects direct array (for now)
export async function getAllBookings(): Promise<Booking[]> {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) {
        console.error(`Fehler beim Laden der Buchungen: ${response.status}`);
        return []
    }

    const rawBookings = await response.json();
    return rawBookings.map((b: any) => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
    }));
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

export async function updateBookingStatus(id: string, newStatus: Booking['status'], message?: string): Promise<void> {
    const body = {
        bookingId: parseInt(id, 10),
        status: newStatus,
        ...(message && { adminMessage: message })
    };

    const response = await fetch(`${API_URL}/status`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) throw new Error(`Fehler beim Aktualisieren des Buchungsstatus: ${response.status}`);
    await response.json();
}

export async function createNewBooking(newBooking: NewBooking): Promise<Booking | undefined> {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
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
    over12Hours: Date[];
    under12Hours: Date[];
};

function calculateDailyCongestion(bookings: Booking[]): CongestionResult {
    const perDay: Map<number, number> = new Map();

    for (const booking of bookings) {
        if (!booking.startDate || !booking.endDate) continue;

        let startUtc = new Date(booking.startDate);
        let endUtc = new Date(booking.endDate);

        const startLocal = new Date(startUtc.getTime());
        const endLocal = new Date(endUtc.getTime());

        let current = new Date(
                startLocal.getFullYear(),
                startLocal.getMonth(),
                startLocal.getDate(),
                0, 0, 0, 0
        );

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

            const overlapStart = new Date(Math.max(dayStart.getTime(), startLocal.getTime()));
            const overlapEnd = new Date(Math.min(dayEnd.getTime(), endLocal.getTime()));

            if (overlapEnd > overlapStart) {
                const ms = overlapEnd.getTime() - overlapStart.getTime();
                const key = dayStart.getTime();

                perDay.set(key, (perDay.get(key) ?? 0) + ms);
            }

            current.setDate(current.getDate() + 1);
        }
    }

    const twelveHoursMs = 12 * 60 * 60 * 1000;

    const over12Hours: Date[] = [];
    const under12Hours: Date[] = [];

    for (const [midnightMs, totalMs] of perDay.entries()) {
        const date = new Date(midnightMs);

        if (totalMs >= twelveHoursMs) over12Hours.push(date);
        else under12Hours.push(date);
    }

    over12Hours.sort((a, b) => a.getTime() - b.getTime());
    under12Hours.sort((a, b) => a.getTime() - b.getTime());

    return { over12Hours, under12Hours };
}
