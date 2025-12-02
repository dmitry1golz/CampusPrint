document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adminLoginForm') as HTMLFormElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!validateAdminEmail(email)) {
            alert('Bitte gib eine gültige Admin-E-Mail-Adresse ein.');
            return;
        }

        if (password.length < 6) {
            alert('Passwort muss mindestens 6 Zeichen lang sein.');
            return;
        }

        // TODO: Replace this with real API login call
        alert(`Login als ${email}...`);
        // fetch('/api/admin/login', { method: 'POST', body: JSON.stringify(...) })
    });
});

function validateAdminEmail(email: string): boolean {
    const pattern = /^[a-zA-Z0-9._%+-]+@campusprint\.de$/;
    return pattern.test(email);
}
