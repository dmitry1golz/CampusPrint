document.addEventListener('DOMContentLoaded', () => {
    const bookingButtons = document.querySelectorAll('#buchenButton');
    const viewDevicesButton = document.querySelector('#geraeteButton');

    bookingButtons.forEach(button => {
        button.addEventListener('click', () => {
            // TODO nur fürs testen der buchen seite, sollte eigentlich auch auf Druckerauswahl gehen?
            // TODO oder soll die buchen seite ohne vorher ausgewählten drucker funktionieren
            window.location.href = '/buchung.html?geraet_id=b856dff6-f4f8-4af1-bb44-888561eb584d';
        });
    });

    if (viewDevicesButton) {
        viewDevicesButton.addEventListener('click', () => {
            window.location.href = '/geraete.html';
        });
    }
});
