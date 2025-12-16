
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

export function setCookie(name: string, value: string, days: number) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        // Modernere Art Leerzeichen zu entfernen (optional, dein Loop geht auch)
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        
        if (c.indexOf(nameEQ) == 0) {
            // HIER IST DIE ÄNDERUNG:
            // Wir schneiden den Wert aus UND decodieren ihn.
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

export function deleteCookie(name: string) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}