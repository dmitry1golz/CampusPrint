document.addEventListener('DOMContentLoaded', () => {
    const myOrdersButton = document.querySelector('.myOrdersButton');
    const viewDevicesButtons = document.querySelectorAll('.orderButton');

    viewDevicesButtons.forEach(button => {
        button.addEventListener('click', () => {
            window.location.href = '/geraete.html';
        });
    });

    if (myOrdersButton) {
        myOrdersButton.addEventListener('click', () => {
            window.location.href = '/meine-drucke.html';
        });
    }
});
