import { PrintBooking } from "./models/buchung.js";
import { getBookingsForEmail } from './services/buchung-service.js';
import { getCookie, setCookie } from './services/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('drucke-form') as HTMLFormElement | null;
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const container = document.getElementById('drucke-ergebnisse') as HTMLElement | null;

    if (!form || !emailInput || !container) return;

    // E-Mail aus Cookie laden und ins Input-Feld setzen
    const savedEmail = getCookie('userEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        // Automatisch die Druckbuchungen laden
        const bookings: PrintBooking[] = getBookingsForEmail(savedEmail);
        renderDrucke(container, bookings);
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email) return;

        // E-Mail im Cookie speichern (30 Tage gültig)
        setCookie('userEmail', email, 30);

        try {
            // const bookings = await fetchPrints(email);
            const bookings: PrintBooking[] = getBookingsForEmail(email);
            renderDrucke(container, bookings);
        } catch (err) {
            console.error(err);
            alert("Fehler beim Laden der Druckbuchungen.");
        }
    });
});

// async function fetchPrints(email: string): Promise<PrintBooking[]> {
//     try {
//         const res = await fetch('/api/prints?email=' + encodeURIComponent(email));
//         if (!res.ok) throw new Error('API antwortet nicht');
//         const data = await res.json();
//         return data as PrintBooking[];
//     } catch {
//         return MOCK_BOOKING;
//     }
// }

function renderDrucke(container: HTMLElement, bookings: PrintBooking[]) {
    container.innerHTML = '';
    if (bookings.length === 0) {
        container.innerHTML = '<p>Keine Buchungen gefunden.</p>';
        return;
    }
    for (const b of bookings) {
        container.appendChild(createCard(b));
    }
}

function createCard(b: PrintBooking): HTMLElement {
    const article = document.createElement('article');
    article.className = 'druckergebnis-card';

    const header = document.createElement('header');
    header.className = 'card-header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'card-title';
    const h3 = document.createElement('h3');
    h3.textContent = b.printerName;
    const bookingId = document.createElement('div');
    bookingId.className = 'booking-id';
    bookingId.textContent = `Buchungs-ID: ${b.id}`;

    titleWrap.appendChild(h3);
    titleWrap.appendChild(bookingId);

    const status = document.createElement('span');
    status.className = 'status-pill ' + b.status;
    status.textContent = capitalize(
        b.status === 'pending' ? 'ausstehend' :
        b.status === 'confirmed' ? 'bestätigt' :
        b.status === 'completed' ? 'abgeschlossen' :
        b.status === 'rejected' ? 'abgelehnt' :
        b.status === 'running' ? 'in Bearbeitung' : b.status
    );

    header.appendChild(titleWrap);
    header.appendChild(status);

    const body = document.createElement('div');
    body.className = 'card-body';

    const dateString = formatDate(b.startDate, b.endDate);
    const timeString = formatTime(b.startDate, b.endDate);

    body.appendChild(metaCol('Datum', dateString));
    body.appendChild(metaCol('Uhrzeit', timeString));

    body.appendChild(metaCol('Notizen', b.notes || '-'));
    if (b.message) {
        body.appendChild(metaCol('Nachricht', b.message));
    }

    article.appendChild(header);
    article.appendChild(body);

    // NEU: Live-Übertragung-Sektion (nur wenn videoUrl vorhanden)
    if (b.videoUrl) {
        const liveSection = document.createElement('div');
        liveSection.className = 'live-feed-section';

        const liveHeader = document.createElement('div');
        liveHeader.className = 'live-feed-header';
        liveHeader.innerHTML = '📹 <strong>Live-Übertragung</strong>';

        const videoWrapper = document.createElement('div');
        videoWrapper.className = 'live-feed-video';

        const img = document.createElement('img');
        img.src = b.videoUrl;
        img.alt = 'Live camera feed';
        img.loading = 'lazy';

        const caption = document.createElement('div');
        caption.className = 'live-feed-caption';
        caption.textContent = 'Live-Kamera des Druckers • Aktualisiert automatisch';

        videoWrapper.appendChild(img);
        liveSection.appendChild(liveHeader);
        liveSection.appendChild(videoWrapper);
        liveSection.appendChild(caption);

        article.appendChild(liveSection);
    }

    return article;
}

function formatDate(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleDateString('de-DE');
    const end = endDate.toLocaleDateString('de-DE');

    return start === end ? start : `${start} \- ${end}`;
}

function formatTime(startDate: Date, endDate: Date): string {
    const start = startDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const end = endDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    return `${start} \- ${end}`;
}

function metaCol(label: string, value: string): HTMLElement {
    const col = document.createElement('div');
    col.className = 'card-col';
    const l = document.createElement('div');
    l.className = 'meta-label';
    l.textContent = label;
    const v = document.createElement('div');
    v.className = 'meta-value';
    v.textContent = value;
    col.appendChild(l);
    col.appendChild(v);
    return col;
}

function capitalize(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
}