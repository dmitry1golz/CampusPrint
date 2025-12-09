document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('bookingForm') as HTMLFormElement;
    const printerInfo = document.getElementById('printerInfo')!;
    const urlParams = new URLSearchParams(window.location.search);
    const geraet = urlParams.get('geraet');

    // Den Namen des Druckers anzeigen
    if (geraet) {
        printerInfo.innerHTML = `<h2>${decodeURIComponent(geraet)}</h2><p class="printer-sub">Hohe Qualität – Automatisches Bedleveling</p>`;
    }

    // Formular bearbeiten
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = (document.getElementById('name') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const date = (document.getElementById('date') as HTMLInputElement).value;
        const start = (document.getElementById('start') as HTMLInputElement).value;
        const end = (document.getElementById('end') as HTMLInputElement).value;
        const notes = (document.getElementById('notes') as HTMLTextAreaElement).value;

        if (!geraet) {
            alert("Kein Gerät ausgewählt!");
            return;
        }

        if (start >= end) {
            alert("Die Endzeit muss nach der Startzeit liegen.");
            return;
        }

        const booking = {
            geraet,
            name,
            email,
            date,
            start,
            end,
            notes,
        };

        console.log("📤 Buchung wird gesendet:", booking);

        // TODO: fetch('/api/buchung', { method: 'POST', body: JSON.stringify(booking) })

        alert("Buchung erfolgreich abgesendet!");
        form.reset();
        window.location.href = "index.html"; 
    });
});
