import { setCookie, getCookie, deleteCookie } from '../utils.js';

const COOKIE_NAME = 'admin_session';

// --- MOCK CREDENTIALS ---
const MOCK_ADMIN = {
    email: 'admin@campusprint.de',
    password: 'password123' // Simples Passwort für die Demo
};

export function login(email: string, pass: string): boolean {
    if (email === MOCK_ADMIN.email && pass === MOCK_ADMIN.password) {
        // Erfolgreich: Setze Session Cookie (gültig für 1 Tag)
        setCookie(COOKIE_NAME, 'true', 1);
        return true;
    }
    return false;
}

export function logout() {
    deleteCookie(COOKIE_NAME);
    // Redirect zum Login
    window.location.href = 'admin-login.html';
}

export function isAuthenticated(): boolean {
    return getCookie(COOKIE_NAME) === 'true';
}

// Schutz-Funktion: Rufe dies am Anfang von geschützten Seiten auf
export function requireAuth() {
    if (!isAuthenticated()) {
        console.warn("Zugriff verweigert. Redirect zum Login.");
        window.location.href = 'admin-login.html';
    }
}