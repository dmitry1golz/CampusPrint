interface PrintBooking {
    id: string;
    printer: string;
    date: string;
    time: string;
    notes?: string;
    message?: string;
    status: 'pending' | 'confirmed' | 'completed' | 'rejected' | 'running' | string;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('drucke-form') as HTMLFormElement | null;
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const container = document.getElementById('drucke-ergebnisse') as HTMLElement | null;

    if (!form || !emailInput || !container) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email) return;
        try {
            // const bookings = await fetchPrints(email);
            // const bookings : PrintBooking[] = []; für leere Ergebnisse
            const bookings : PrintBooking[] = mockBookings();
            renderDrucke(container, bookings);
        } catch (err) {
            console.error(err);
            alert("Fehler beim Laden der Druckbuchungen.");
        }
    });
    renderDrucke(container, mockBookings()); // TODO Demo-Zwecke
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
    status.textContent = capitalize(b.status === 'pending'
        ? 'ausstehend'
        : b.status === 'confirmed'
        ? 'bestätigt'
        : b.status === 'completed'
        ? 'abgeschlossen'
        : b.status === 'rejected'
        ? 'abgelehnt'
        : b.status === 'running'
        ? 'in Bearbeitung'
        : b.status);

    header.appendChild(titleWrap);
    header.appendChild(status);

    const body = document.createElement('div');
    body.className = 'card-body';

    body.appendChild(metaCol('Datum', b.date));
    body.appendChild(metaCol('Uhrzeit', b.time));
    body.appendChild(metaCol('Notizen', b.notes || '-'));
    if ( b.message ) {
        body.appendChild(metaCol('Nachricht', b.message || '-'));
    }

    article.appendChild(header);
    article.appendChild(body);

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