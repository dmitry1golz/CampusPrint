import { login } from './services/auth-service.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adminLoginForm') as HTMLFormElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    // Das neue Error-Element holen
    const errorBanner = document.getElementById('login-error') as HTMLDivElement;

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Alten Fehler ausblenden bei neuem Versuch
            if(errorBanner) errorBanner.classList.add('hidden');
            
            const email = emailInput.value;
            const password = passwordInput.value;

            const success = login(email, password);

            if (success) {
                window.location.href = 'admin.html';
            } else {
                // UI Feedback statt Alert
                if(errorBanner) {
                    errorBanner.classList.remove('hidden');
                } else {
                    // Fallback falls HTML nicht aktuell ist
                    alert('Falsche Zugangsdaten!');
                }
                
                // Passwort leeren
                passwordInput.value = '';
                // Fokus zurück ins Passwort Feld
                passwordInput.focus();
            }
        });
    }
});