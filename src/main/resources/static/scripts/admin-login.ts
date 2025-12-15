import { login, isAuthenticated } from './services/auth-service.js';

if (isAuthenticated()) {
    window.location.href = 'admin.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adminLoginForm') as HTMLFormElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const errorBanner = document.getElementById('login-error') as HTMLDivElement;

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if(errorBanner) errorBanner.classList.add('hidden');

            const email = emailInput.value;
            const password = passwordInput.value;

            const success = login(email, password);

            if (success) {
                window.location.href = 'admin.html';
            } else {
                if (errorBanner) {
                    errorBanner.classList.remove('hidden');
                } else {
                    alert('Falsche Zugangsdaten!');
                }
                
                passwordInput.value = '';
                passwordInput.focus();
            }
        });
    }
});