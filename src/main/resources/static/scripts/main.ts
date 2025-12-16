document.addEventListener('DOMContentLoaded', () => {
    const bookingButtons = document.querySelectorAll('#myOrdersButton');
    const viewDevicesButton = document.querySelector('#orderButton');

    bookingButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = '/meine-drucke.html';
        });
    });

    if (viewDevicesButton) {
        viewDevicesButton.addEventListener('click', () => {
            window.location.href = '/deviceCatalog.html';
        });
    }
});
