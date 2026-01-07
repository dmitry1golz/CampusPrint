import { Booking } from "./models/booking.js";
import { getBookingsForEmail } from './services/bookingService.js';
import { getCookie, setCookie } from './services/authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('drucke-form') as HTMLFormElement | null;
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const container = document.getElementById('drucke-ergebnisse') as HTMLElement | null;

    if (!form || !emailInput || !container) return;

    const savedEmail = getCookie('userEmail');
    if (savedEmail) {
        emailInput.value = savedEmail;
        renderPrintBookings(container, getBookingsForEmail(savedEmail));
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        if (!email) return;

        setCookie('userEmail', email, 30);
        renderPrintBookings(container, getBookingsForEmail(email));
    });
});

function renderPrintBookings(container: HTMLElement, bookings: Booking[]) {
    container.innerHTML = '';
    
    if (bookings.length === 0) {
        container.innerHTML = '<div class="alert alert-danger w-full text-center">Keine Buchungen gefunden.</div>';
        return;
    }

    container.className = 'cards-grid';

    for (const b of bookings) {
        container.appendChild(createCard(b));
    }
}

function createCard(b: Booking): HTMLElement {
    const article = document.createElement('article');
    article.className = 'card'; // base.css Klasse

    const dateString = formatDate(b.startDate, b.endDate);
    const timeString = formatTime(b.startDate, b.endDate);

    article.innerHTML = `
        <header class="card-header mb-2" style="display:flex; justify-content:space-between; align-items:flex-start;">
            <div>
                <h3 class="font-bold text-main" style="margin:0;">${b.printerName}</h3>
                <div class="text-xs text-muted">ID: ${b.id}</div>
            </div>
            <span class="badge ${b.status}">
                ${translateStatus(b.status)}
            </span>
        </header>

        <div class="card-body" style="display:flex; gap:1.5rem; flex-wrap:wrap;">
            ${metaColHtml('Datum', dateString)}
            ${metaColHtml('Uhrzeit', timeString)}
            ${metaColHtml('Notizen', b.notes || '-')}
            ${b.message ? `<div class="w-full" style="color:var(--danger); font-size:0.85rem; margin-top:0.5rem;"><strong>Grund:</strong> ${b.message}</div>` : ''}
        </div>

        ${b.videoUrl ? `
            <div class="live-feed-section mt-2 pt-1" style="border-top:1px solid var(--border-color);">
                <div class="text-sm font-bold mb-1">📹 Live-Übertragung</div>
                <div class="live-feed-video" style="background:#000; border-radius:4px; overflow:hidden;">
                    <img src="${b.videoUrl}" alt="Live Feed" style="width:100%; display:block;" loading="lazy">
                </div>
            </div>
        ` : ''}
    `;

    return article;
}

// helpfunctions
function translateStatus(s: string): string {
    const map: any = { 
        'pending': 'Ausstehend', 
        'confirmed': 'Bestätigt', 
        'running': 'In Arbeit', 
        'completed': 'Fertig', 
        'rejected': 'Abgelehnt' 
    };
    return map[s] || s;
}

function metaColHtml(label: string, value: string): string {
    return `
        <div class="detail-col">
            <div class="text-xs text-muted mb-1">${label}</div>
            <div class="text-sm font-medium">${value}</div>
        </div>
    `;
}

function formatDate(start: Date, end: Date): string {
    const s = new Date(start).toLocaleDateString('de-DE');
    const e = new Date(end).toLocaleDateString('de-DE');
    return s === e ? s : `${s} - ${e}`;
}

function formatTime(start: Date, end: Date): string {
    const opts: any = { hour: '2-digit', minute: '2-digit' };
    return `${new Date(start).toLocaleTimeString('de-DE', opts)} - ${new Date(end).toLocaleTimeString('de-DE', opts)}`;
}