document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn') as HTMLButtonElement;
    const emailInput = document.getElementById('emailInput') as HTMLInputElement;

    searchBtn.addEventListener('click', () => {
        const email = emailInput.value.trim();

        if (!validateEmail(email)) {
            alert('Bitte gib eine gültige E-Mail-Adresse ein.');
            return;
        }

        // API
        alert(`Buchungen für ${email} werden geladen...`);
        // fetch('/api/prints?email=' + encodeURIComponent(email)) ...
    });
});

function validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@^[a-z.-]\.^[a-z]$/;
    return emailRegex.test(email);
}
