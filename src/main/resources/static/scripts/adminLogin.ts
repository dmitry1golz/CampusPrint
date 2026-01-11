import { login, isAuthenticated } from './services/authService.js';

document.addEventListener('DOMContentLoaded', async () => {

    if (await isAuthenticated()) {
        window.location.href = 'admin.html';
        return;
    }

    const form = document.getElementById('adminLoginForm') as HTMLFormElement | null;
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const passwordInput = document.getElementById('password') as HTMLInputElement | null;
    const errorBanner = document.getElementById('login-error') as HTMLDivElement | null;

    if (!form || !emailInput || !passwordInput) return;


    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        errorBanner?.classList.add('hidden');

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        const success = await login(email, password);

        if (success) {
            window.location.href = 'admin.html';
            return;
        }

        if (errorBanner) errorBanner.classList.remove("hidden");
        else alert("Falsche Zugangsdaten!");

        passwordInput.value = '';
        passwordInput.focus();

    });

});
