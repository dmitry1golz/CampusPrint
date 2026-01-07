import { Booking, NewBooking, BookingAvailability } from '../models/booking.js';
import { Device } from '../models/device.js';
import { getDeviceById } from './deviceService.js';

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

export function getBookingsForEmail(email: string): Booking[] {
    return MOCK_BOOKING;
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

export async function createNewBooking(newBooking: NewBooking) {
    // newBooking.printerId is now a number. getGeraetById expects number.
    // Casting or direct usage works if NewPrintBooking interface has number type for printerId.
    // Assuming newBooking.printerId is number based on updated models.
    const printer = await getDeviceById(newBooking.printerId);
    
    const booking: Booking = {
        id: `book-${Date.now()}`,
        printerName: printer ? printer.name : 'Unknown',
        startDate: newBooking.startDate,
        endDate: newBooking.endDate,
        notes: newBooking.notes,
        status: 'pending'
    };
    MOCK_BOOKING.push(booking);
    console.log("Booking created locally (Mock):", booking);
}

export async function getBookingAvailabilityForDevice(device: Device): Promise<BookingAvailability | undefined> {
    const response = await fetch(`${API_URL}?deviceId=${device.id}&futureOnly=true`);
    if (!response.ok) return undefined;
    const bookings: Booking[] = await response.json();

    // ---------- Convert Booked Days into Map of free hours per day
    let bookedDays: Map<Date, number> = new Map();
    function subTractHoursFromDay(day: Date, toSubtract: number) {
        if (!bookedDays.has(day)) {
            bookedDays.set(day, 24);
        }
        bookedDays.set(day, bookedDays.get(day)! - toSubtract);
    }
    for (let booking of bookings) {
        // Same day -> Subtract the hours
        if (booking.startDate.getFullYear() === booking.endDate.getFullYear() &&
            booking.startDate.getMonth() === booking.endDate.getMonth() &&
            booking.startDate.getDate() === booking.endDate.getDate()) {
            const diffMs = Math.abs(booking.startDate.getTime() - booking.startDate.getTime()); // difference in milliseconds
            const diffHours = diffMs / (1000 * 60 * 60); // convert ms -> hours
            subTractHoursFromDay(new Date(booking.startDate.getFullYear(), booking.startDate.getMonth(), booking.startDate.getDate()), diffHours);
        } else {
            // Subtract start and end hours from each of thair days
            const hoursPassedFirstDay = booking.startDate.getHours() + booking.startDate.getMinutes() / 60 + booking.startDate.getSeconds() / 3600;
            subTractHoursFromDay(new Date(booking.startDate.getFullYear(), booking.startDate.getMonth(), booking.startDate.getDate()), hoursPassedFirstDay);

            const hoursRemainingSecondDay = 24 - (booking.endDate.getHours() + booking.endDate.getMinutes() / 60 + booking.endDate.getSeconds() / 3600);
            subTractHoursFromDay(new Date(booking.endDate.getFullYear(), booking.endDate.getMonth(), booking.endDate.getDate()), hoursRemainingSecondDay);
        }
    }
    return {
        blockedWeekDays: device.bookingAvailabilityBlockedWeekdays ?? [],
        // Less than 10 Hours remaining is fully booked
        fullyBookedDays: Array.from(bookedDays.entries())
            .filter(([_, value]) => value < 10)
            .map(([date, _]) => date),
        // Anything with more than 10 Hours free but still a booking
        partialyBookedDays: Array.from(bookedDays.entries())
            .filter(([_, value]) => value >= 10)
            .map(([date, _]) => date)
    };
}