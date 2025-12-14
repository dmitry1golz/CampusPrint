interface PrintBooking {
    id: string;
    printer: string;
    date: string;
    time: string;
    notes?: string;
    message?: string;
    videoUrl?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'running' | string;
}

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
        const bookings: PrintBooking[] = mockBookings();
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
            const bookings: PrintBooking[] = mockBookings();
            renderDrucke(container, bookings);
        } catch (err) {
            console.error(err);
            alert("Fehler beim Laden der Druckbuchungen.");
        }
    });
});

async function fetchPrints(email: string): Promise<PrintBooking[]> {
    try {
        const res = await fetch('/api/prints?email=' + encodeURIComponent(email));
        if (!res.ok) throw new Error('API antwortet nicht');
        const data = await res.json();
        return data as PrintBooking[];
    } catch {
        return mockBookings();
    }
}

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
    h3.textContent = b.printer;
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

    body.appendChild(metaCol('Datum', b.date));
    body.appendChild(metaCol('Uhrzeit', b.time));
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

function setCookie(name: string, value: string, days: number = 30): void {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; ${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length));
        }
    }
    return null;
}

function mockBookings(): PrintBooking[] {
    return [
        {
            id: 'book-1763276488435',
            printer: 'Ultimaker S5',
            date: '21.11.2025',
            time: '13:00 - 19:00',
            notes: 'Prototypen',
            status: 'rejected',
            message: "Der Zeitslot ist leider nicht verfügbar. Ich könnte dir anbieren, den Druck am 25.11.2025 " +
                "durchzuführen. Sonst melde dich unter admin@campusprint.de, damit wir einen Termin finden."
        },
        {
            id: 'book-1763276489000',
            printer: 'Prusa MK3',
            date: '22.11.2025',
            time: '09:00 - 12:00',
            notes: 'Testdruck',
            videoUrl: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.schaan.li%2Fapplication' +
                '%2Ffiles%2Fthumbnails%2Flarge%2F9116%2F5174%2F4032%2F3D-Druck.jpg',
            status: 'running'
        },
        {
            id: 'book-1763276490123',
            printer: 'Ender 3',
            date: '23.11.2025',
            time: '08:00 - 14:00',
            notes: 'Miniatur-Serie',
            status: 'pending'
        },
        {
            id: 'book-1763276491456',
            printer: 'Formlabs Form 3',
            date: '24.11.2025',
            time: '10:00 - 16:00',
            notes: 'Gehäuse Prototyp',
            status: 'confirmed'
        },
        {
            id: 'book-1763276493012',
            printer: 'Anycubic Photon',
            date: '20.11.2025',
            time: '07:00 - 13:00',
            notes: 'Kleinteile Batch',
            status: 'completed'
        },
    ];
}