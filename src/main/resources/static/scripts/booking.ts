import { createNewBooking, getBookingAvailabilityForDevice } from "./services/bookingService.js";
import { Booking, BookingAvailability, NewBooking } from "./models/booking.js";
import { getDeviceById } from "./services/deviceService.js";
import { setCookie } from "./services/authService.js";
import { Device } from "./models/device.js";

type BookingPageState = 'loading' | 'error' | 'ready';

interface DateSelectorOption {
    value: string;
    selectable: boolean;
    isSelected: boolean;
    status: 'invalid-date' | 'availible' | 'unavailible' | 'booked' | 'partially-booked';
    date: Date;
}

const invalidDate: DateSelectorOption = {
    value: "", selectable: false, isSelected: false, status: 'invalid-date', date: new Date(0)
};

let currentlySelectedDate: Date | undefined;
let currentDateSelectorYear: number = new Date().getFullYear();
let currentDateSelectorMonth: number = new Date().getMonth();

let device: Device;
let bookingAvailability: BookingAvailability;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const deviceIdStr = urlParams.get('device_id');

    if (!deviceIdStr) {
        updateState('error');
        return;
    }

    // Fetch real device data from Backend via Service
    const foundDevice = await getDeviceById(deviceIdStr);

    if (!foundDevice) {
        console.error(`Device with ID ${deviceIdStr} not found.`);
        updateState('error');
        return;
    }

    device = foundDevice;
    
    const foundBookingAvailability = await getBookingAvailabilityForDevice(device);
    if (!foundBookingAvailability) {
        console.error(`BookingAvailability not found.`);
        updateState('error');
        return;
    }
    bookingAvailability = foundBookingAvailability;

    // Populate UI
    document.getElementById('printerInfo-Name')!.innerText = device.name;
    document.getElementById('printerInfo-Description')!.innerText = device.description;

    const form = document.getElementById('bookingForm') as HTMLFormElement;
    form.addEventListener('submit', handleFormSubmit);

    document.getElementById('dateSelectorPreviousMonth')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('dateSelectorNextMonth')?.addEventListener('click', () => changeMonth(1));

    renderDateSelector(currentlySelectedDate, currentDateSelectorYear, currentDateSelectorMonth);
    updateState('ready');
});

// Made async to await the booking creation
async function handleFormSubmit(e: Event) {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const start = (document.getElementById('start') as HTMLInputElement).value;
    const end = (document.getElementById('end') as HTMLInputElement).value;
    const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;

    if (!currentlySelectedDate || start >= end) {
        alert("Please check date and time.");
        return;
    }

    // printerId must be number now
    const booking: NewBooking = {
        printerId: device.id,
        userEmail: email,
        startDate: createDateTime(currentlySelectedDate, start),
        endDate: createDateTime(currentlySelectedDate, end),
        notes: notes
    };

    const createdBooking: Booking | undefined = await createNewBooking(booking);
    if (createdBooking === undefined) {
        updateState('error');
    } else {
        setCookie('userEmail', email, 30);
        window.location.href = "myPrints.html";
    }
    
}

function renderDateSelector(selectedDate: Date | undefined, year: number, month: number) {
    const grid = document.getElementById('dateSelectorGrid')!;
    const header = document.getElementById('dateSelectorHeaderValue')!;
    
    header.innerText = new Date(year, month).toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    while (grid.children.length > 1) grid.removeChild(grid.lastElementChild!);

    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const days: DateSelectorOption[] = [];

    for (let i = 0; i < firstWeekDay; i++) days.push(invalidDate);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        let status: DateSelectorOption['status'] = 'availible';
        let selectable = true;

        if (date < today || bookingAvailability.blockedWeekDays.includes((date.getDay() + 6) % 7)) {
            status = 'unavailible'; selectable = false;
        } else if (bookingAvailability.fullyBookedDays.some(d => d.getTime() === date.getTime())) {
            status = 'booked'; selectable = false;
        } else if (bookingAvailability.partialyBookedDays.some(d => d.getTime() === date.getTime())) {
            status = 'partially-booked';
        }

        days.push({ value: i.toString(), selectable, isSelected: date.getTime() === selectedDate?.getTime(), status, date });
    }

    const rowCount = Math.ceil(days.length / 7);
    for (let r = 0; r < rowCount; r++) {
        const row = document.createElement('div');
        row.className = 'dateSelectorRow';
        for (let d = 0; d < 7; d++) {
            const dayObj = days[r * 7 + d] || invalidDate;
            const cell = document.createElement('div');
            cell.innerText = dayObj.value;
            
            if (dayObj.status !== 'invalid-date') {
                cell.classList.add(`date-${dayObj.status.split('-')[0]}`);
                if (dayObj.isSelected) cell.classList.add('selected');
                if (dayObj.selectable) {
                    cell.classList.add('selectable');
                    cell.onclick = () => { currentlySelectedDate = dayObj.date; renderDateSelector(currentlySelectedDate, year, month); };
                }
            } else {
                cell.style.visibility = 'hidden';
            }
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
}

function changeMonth(offset: number) {
    currentDateSelectorMonth += offset;
    if (currentDateSelectorMonth < 0) { currentDateSelectorMonth = 11; currentDateSelectorYear--; }
    else if (currentDateSelectorMonth > 11) { currentDateSelectorMonth = 0; currentDateSelectorYear++; }
    renderDateSelector(currentlySelectedDate, currentDateSelectorYear, currentDateSelectorMonth);
}

function updateState(newState: BookingPageState) {
    ['loading', 'error', 'ready'].forEach(s => {
        const el = document.getElementById(`pageState-${s}`);
        if (el) el.classList.toggle('hidden', s !== newState);
    });
}

function createDateTime(date: Date, timeStr: string): Date {
    const [h, m] = timeStr.split(':').map(Number);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
}