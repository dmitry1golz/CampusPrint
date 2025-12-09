document.addEventListener('DOMContentLoaded', () => {
    const bookingButtons = document.querySelectorAll('.btn.primary');
    const viewDevicesButton = document.querySelector('.btn.secondary');

    bookingButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('Weiterleitung zur Buchungsseite...');
            // window.location.href = '/buchung'; // Füge den richtigen Pfad ein
        });
    });

    if (viewDevicesButton) {
        viewDevicesButton.addEventListener('click', () => {
            alert('Zeige verfügbare Geräte...');
            // window.location.href = '/geraete'; // Füge den richtigen Pfad ein
        });
    }
});
