import { createNewBooking } from "./services/buchung-service.js";
import { getGeraetById } from "./services/geraet-service.js";
import { setCookie } from "./utils.js";

type BuchenPageState = 'loading' | 'error' | 'ready';

// ---------- Constant Elements -----------
const loadingStateElement = document.getElementById('pageState-loading');
const errorStateElement = document.getElementById('pageState-error');
const readyStateElement = document.getElementById('pageState-ready');

const form = document.getElementById('bookingForm') as HTMLFormElement;
const printerInfo = document.getElementById('printerInfo')!;
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
            startDate: `${date} - ${start}`,
            endDate: `${date} - ${end}`,
            notes: notes, // treat empty string as null?
        }

        createNewBooking(booking);

        form.reset();

        setCookie('userEmail', email, 30)

        window.location.href = "meine-drucke.html"; 
    });

    // Page ready
    updateState('ready')
});

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