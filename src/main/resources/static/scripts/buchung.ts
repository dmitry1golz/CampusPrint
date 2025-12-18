import { createNewBooking, getBuchungsverfuegbarkeitByGeraetId } from "./services/buchung-service.js";
import { Buchungsverfuegbarkeit, NewPrintBooking } from "./models/buchung.js";
import { getGeraetById } from "./services/geraet-service.js";
import { setCookie } from "./services/auth-service.js";
import { Geraet } from "./models/geraet.js";

type BuchenPageState = 'loading' | 'error' | 'ready';
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

let geraet: Geraet;
let buchungsverfuegbarkeit: Buchungsverfuegbarkeit;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const geraetId = urlParams.get('geraet_id');

    if (!geraetId || !getGeraetById(geraetId)) {
        updateState('error');
        return;
    }

    geraet = getGeraetById(geraetId)!;
    buchungsverfuegbarkeit = getBuchungsverfuegbarkeitByGeraetId(geraetId);

    // Printer Info setzen
    document.getElementById('printerInfo-Name')!.innerText = geraet.name;
    document.getElementById('printerInfo-Description')!.innerText = geraet.description;

    const form = document.getElementById('bookingForm') as HTMLFormElement;
    form.addEventListener('submit', handleFormSubmit);

    document.getElementById('dateSelectorPreviousMonth')?.addEventListener('click', () => changeMonth(-1));
    document.getElementById('dateSelectorNextMonth')?.addEventListener('click', () => changeMonth(1));

    renderDateSelector(currentlySelectedDate, currentDateSelectorYear, currentDateSelectorMonth);
    updateState('ready');
});

function handleFormSubmit(e: Event) {
    e.preventDefault();
    const email = (document.getElementById('email') as HTMLInputElement).value;
    const start = (document.getElementById('start') as HTMLInputElement).value;
    const end = (document.getElementById('end') as HTMLInputElement).value;
    const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;

    if (!currentlySelectedDate || start >= end) {
        alert("Bitte prüfe Datum und Uhrzeit.");
        return;
    }

    const booking: NewPrintBooking = {
        printerId: geraet.id,
        startDate: createDateTime(currentlySelectedDate, start),
        endDate: createDateTime(currentlySelectedDate, end),
        notes: notes
    };

    createNewBooking(booking);
    setCookie('userEmail', email, 30);
    window.location.href = "meine-drucke.html";
}

function renderDateSelector(selectedDate: Date | undefined, year: number, month: number) {
    const grid = document.getElementById('dateSelectorGrid')!;
    const header = document.getElementById('dateSelectorHeaderValue')!;
    
    header.innerText = new Date(year, month).toLocaleString('de-DE', { month: 'long', year: 'numeric' });

    // Grid leeren außer Wochentags-Header
    while (grid.children.length > 1) grid.removeChild(grid.lastElementChild!);

    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const days: DateSelectorOption[] = [];

    for (let i = 0; i < firstWeekDay; i++) days.push(invalidDate);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (let i = 1; i <= new Date(year, month + 1, 0).getDate(); i++) {
        const date = new Date(year, month, i);
        let status: DateSelectorOption['status'] = 'availible';
        let selectable = true;

        if (date < today || buchungsverfuegbarkeit.blockedWeekDays.includes((date.getDay() + 6) % 7)) {
            status = 'unavailible'; selectable = false;
        } else if (buchungsverfuegbarkeit.fullyBookedDays.some(d => d.getTime() === date.getTime())) {
            status = 'booked'; selectable = false;
        } else if (buchungsverfuegbarkeit.partialyBookedDays.some(d => d.getTime() === date.getTime())) {
            status = 'partially-booked';
        }

        days.push({ value: i.toString(), selectable, isSelected: date.getTime() === selectedDate?.getTime(), status, date });
    }

    // Grid auffüllen
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

function updateState(newState: BuchenPageState) {
    ['loading', 'error', 'ready'].forEach(s => {
        const el = document.getElementById(`pageState-${s}`);
        if (el) el.classList.toggle('hidden', s !== newState);
    });
}

function createDateTime(date: Date, timeStr: string): Date {
    const [h, m] = timeStr.split(':').map(Number);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m);
}