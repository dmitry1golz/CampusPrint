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
    value: "",
    selectable: false,
    isSelected: false,
    status: 'invalid-date',
    date: new Date(0, 0 ,0),
}

var currentlySelectedDate: Date | undefined;
var currentDateSelectorYear: number;
var currentDateSelectorMonth: number;

var geraet: Geraet;
var buchungsverfuegbarkeit: Buchungsverfuegbarkeit;

// ---------- Constant Elements -----------
const loadingStateElement = document.getElementById('pageState-loading');
const errorStateElement = document.getElementById('pageState-error');
const readyStateElement = document.getElementById('pageState-ready');

const form = document.getElementById('bookingForm') as HTMLFormElement;

const dateSelectorPreviousMonth = document.getElementById('dateSelectorPreviousMonth')!;
const dateSelectorNextMonth = document.getElementById('dateSelectorNextMonth')!;
// ----------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);

    // Loading Device Data
    const geraetId = urlParams.get('geraet_id');
    if (!geraetId) {
        updateState('error');
        return;
    }
    const tmpGeraet = getGeraetById(geraetId!);
    if (!tmpGeraet) {
        updateState('error');
        return;
    }
    geraet = tmpGeraet;
    buchungsverfuegbarkeit = getBuchungsverfuegbarkeitByGeraetId(geraetId);

    // Set Printer Data
    document.getElementById('printerInfo-Name')!.innerText=geraet.name;
    document.getElementById('printerInfo-Description')!.innerText=geraet.description;

    // Formular bearbeiten
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // TODO name not used
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const start = (document.getElementById('start') as HTMLInputElement).value;
        const end = (document.getElementById('end') as HTMLInputElement).value;
        const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;
        
        // Validate Data
        if (start >= end) {
            alert("Die Endzeit muss nach der Startzeit liegen.");
            return;
        }
        if (currentlySelectedDate === undefined) {
            alert("Es muss ein Datum ausgewählt sein.");
            return;
        }

        const booking: NewPrintBooking = {
            printerId: geraet.id,
            startDate: new Date(
                currentlySelectedDate.getFullYear(),
                currentlySelectedDate.getMonth(),
                currentlySelectedDate.getDate(),
                parseInt(start.split(":")[0]),
                parseInt(start.split(":")[1]),
            ),
            endDate: new Date(
                currentlySelectedDate.getFullYear(),
                currentlySelectedDate.getMonth(),
                currentlySelectedDate.getDate(),
                parseInt(end.split(":")[0]),
                parseInt(end.split(":")[1]),
            ),
            notes: notes, // treat empty string as null?
        }

        createNewBooking(booking);

        form.reset();

        setCookie('userEmail', email, 30)

        window.location.href = "meine-drucke.html"; 
    });

    dateSelectorPreviousMonth.addEventListener('click', () => {
        if (currentDateSelectorMonth === 0) {
            currentDateSelectorYear--;
            currentDateSelectorMonth = 11;
        } else {
            currentDateSelectorMonth--;
        }
        renderDateSelector(
            currentlySelectedDate,
            currentDateSelectorYear,
            currentDateSelectorMonth
        );
    });

    dateSelectorNextMonth.addEventListener('click', () => {
        if (currentDateSelectorMonth === 11) {
            currentDateSelectorYear++;
            currentDateSelectorMonth = 0;
        } else {
            currentDateSelectorMonth++;
        }
        renderDateSelector(
            currentlySelectedDate,
            currentDateSelectorYear,
            currentDateSelectorMonth
        );
    });

    currentDateSelectorYear = new Date().getFullYear();
    currentDateSelectorMonth = new Date().getMonth();

    renderDateSelector(
        currentlySelectedDate,
        currentDateSelectorYear,
        currentDateSelectorMonth
    );

    // Page ready
    updateState('ready')
});

function renderDateSelector(selectedDate: Date | undefined, year: number, month: number) {
    const dateGridDiv = document.getElementById('dateSelectorGrid')!;
    const dateHeaderValue = document.getElementById('dateSelectorHeaderValue')!;

    // Set Header Value
    const monthYearDateObj = new Date(year, month);
    const headerValue = monthYearDateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    dateHeaderValue.innerText = headerValue;

    // Clear grid (only leave first Weekdayname row)
    while (dateGridDiv.children.length > 1) {
        dateGridDiv.removeChild(dateGridDiv.lastElementChild!);
    }

    // Array of all the numbers and spaces
    var dateGridTextArray: DateSelectorOption[] = [];

    // Get Where the first day starts
    // getDay(): 0 = Sontag, 1 = Montag, ... 6 = Samstag
    // After conversion: 0 = Montag, 1 = Dienstag, ... 6 = Sontag
    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    // Check how many spaes need to be put in first
    for (var i = 0; i < firstWeekDay; i++) {
        dateGridTextArray.push(invalidDate);
    }

    for(var i = 1; i <= daysInMonth(year, month); i++) {
        const now = new Date();
        const currentDayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const currentDate = new Date(year, month, i)
        if (currentDate < currentDayDate) {
            // Date is in the Past
            dateGridTextArray.push({
                selectable: false,
                isSelected: false,
                value: i.toString(),
                status: "unavailible",
                date: currentDate,
            });
        } else if (buchungsverfuegbarkeit.blockedWeekDays.find((blockedWeekDay) => blockedWeekDay === ((currentDate.getDay() + 6) % 7)) !== undefined) {
            // Day is a blocked day
            dateGridTextArray.push({
                selectable: false,
                isSelected: false,
                value: i.toString(),
                status: "unavailible",
                date: currentDate,
            });
        } else if (buchungsverfuegbarkeit.fullyBookedDays.find((bookedDay) => bookedDay.getTime() === currentDate.getTime()) !== undefined) {
            // Day is a booked day
            dateGridTextArray.push({
                selectable: false,
                isSelected: false,
                value: i.toString(),
                status: "booked",
                date: currentDate,
            });
        } else if (buchungsverfuegbarkeit.partialyBookedDays.find((partialyBookedDay) => partialyBookedDay.getTime() === currentDate.getTime()) !== undefined) {
            // Day is a partialy booked day
            dateGridTextArray.push({
                selectable: true,
                isSelected: currentDate.getTime() === selectedDate?.getTime(),
                value: i.toString(),
                status: "partially-booked",
                date: currentDate,
            });
        } else {
            dateGridTextArray.push({
                selectable: true,
                isSelected: currentDate.getTime() === selectedDate?.getTime(),
                value: i.toString(),
                status: "availible",
                date: currentDate,
            });
        }
    }

    // Add Trailing Spaces
    var remaining = (7 - (dateGridTextArray.length % 7)) % 7;
    for (var i = 0; i < remaining; i++) {
        dateGridTextArray.push(invalidDate);
    }

    // Render Array
    for (var x = 0; x < dateGridTextArray.length / 7; x++) {
        var currentRow = document.createElement('div');
        currentRow.classList.add('dateSelectorRow');

        for (var y = 0; y < 7; y++) {
            const currentCalNumber = document.createElement('div');
            const dateObj = dateGridTextArray[(x * 7) + y];
            currentCalNumber.innerText = dateObj.value;
            switch (dateObj.status) {
                case "invalid-date":
                    currentCalNumber.style.visibility = 'hidden'
                    break;
                case "availible":
                    break;
                case "unavailible":
                    currentCalNumber.style.backgroundColor = '#7c7c7c'
                    break;
                case "booked":
                    currentCalNumber.style.backgroundColor = '#d93434ff'
                    break;
                case "partially-booked":
                    currentCalNumber.style.backgroundColor = '#db934bff'
                    break;
            }
            if (dateObj.isSelected) {
                currentCalNumber.classList.add("selected");
            } else if (dateObj.selectable) {
                currentCalNumber.classList.add("selectable");
                currentCalNumber.addEventListener('click', () => {
                    selectDate(dateObj.date);
                });
            }
            currentRow.appendChild(currentCalNumber);
        }

        dateGridDiv.appendChild(currentRow);
    }
}

function selectDate(date: Date) {
    document.getElementById("date")!.innerText = date.toString();
    currentlySelectedDate = date;

    renderDateSelector(
        currentlySelectedDate,
        currentDateSelectorYear,
        currentDateSelectorMonth
    );
}

function daysInMonth(year: number, month: number) {
    // Month is 0-based: Jan = 0, Dec = 11
    // Passing day 0 gives the last day of the previous month, so month+1, day 0 = last day of "month"
    return new Date(year, month + 1, 0).getDate();
}

function updateState(newState: BuchenPageState) {
    loadingStateElement!.hidden = true;
    errorStateElement!.hidden = true;
    readyStateElement!.hidden = true;
    switch(newState) {
        case "loading":
            loadingStateElement!.hidden = false;
            break;
        case "error":
            errorStateElement!.hidden = false;
            break;
        case "ready":
            readyStateElement!.hidden = false;
            break;
    }
}