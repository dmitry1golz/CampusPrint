import { createNewBooking } from "./services/buchung-service.js";
import { getGeraetById } from "./services/geraet-service.js";
import { setCookie } from "./utils.js";

type BuchenPageState = 'loading' | 'error' | 'ready';

var currentlySelectedDate: Date | undefined;
var currentDateSelectorYear: number;
var currentDateSelectorMonth: number;

// ---------- Constant Elements -----------
const loadingStateElement = document.getElementById('pageState-loading');
const errorStateElement = document.getElementById('pageState-error');
const readyStateElement = document.getElementById('pageState-ready');

const form = document.getElementById('bookingForm') as HTMLFormElement;
// ----------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);

    // Loading Device Data
    const geraetId = urlParams.get('geraet_id');
    if (!geraetId) {
        updateState('error');
        return;
    }
    const geraet = getGeraetById(geraetId!);
    if (!geraet) {
        updateState('error');
        return;
    }

    // Set Printer Data
    document.getElementById('printerInfo-Name')!.innerText=geraet.name;
    document.getElementById('printerInfo-Description')!.innerText=geraet.description;

    // Formular bearbeiten
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // TODO name not used
        const name = (document.getElementById('name') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const date = (document.getElementById('date') as HTMLInputElement).value;
        const start = (document.getElementById('start') as HTMLInputElement).value;
        const end = (document.getElementById('end') as HTMLInputElement).value;
        const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;
        
        // Validate Data
        if (start >= end) {
            alert("Die Endzeit muss nach der Startzeit liegen.");
            return;
        }

        const booking: NewPrintBooking = {
            printerId: geraet.id,
            date: date,
            time: `${start} - ${end}`,
            notes: notes, // treat empty string as null?
        }

        createNewBooking(booking);

        form.reset();

        setCookie('userEmail', email, 30)

        window.location.href = "meine-drucke.html"; 
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

    // Array of all the numbers and spaces
    var dateGridTextArray: string[] = [];

    // Get Where the first day starts
    // getDay(): 0 = Sontag, 1 = Montag, ... 6 = Samstag
    // After conversion: 0 = Montag, 1 = Dienstag, ... 6 = Sontag
    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    // Check how many spaes need to be put in first
    for (var i = 0; i < firstWeekDay; i++) {
        dateGridTextArray.push("");
    }

    for(var i = 1; i <= daysInMonth(year, month); i++) {
        dateGridTextArray.push(i.toString());
    }

    // Add Trailing Spaces
    var remaining = (7 - (dateGridTextArray.length % 7)) % 7;
    for (var i = 0; i < remaining; i++) {
        dateGridTextArray.push("");
    }

    // Render Array
    for (var x = 0; x < dateGridTextArray.length / 7; x++) {
        var currentRow = document.createElement('div');
        currentRow.classList.add('dateSelectorRow');

        for (var y = 0; y < 7; y++) {
            var currentCalNumber = document.createElement('div');
            currentCalNumber.innerText = dateGridTextArray[(x * 7) + y];
            if (currentCalNumber.innerText === "") {
                currentCalNumber.style.visibility = 'hidden'
            } 
            currentRow.appendChild(currentCalNumber);
        }

        dateGridDiv.appendChild(currentRow);
    }
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