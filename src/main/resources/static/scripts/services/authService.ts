
const COOKIE_NAME = 'admin_session';

// Mock credentials
const MOCK_ADMIN = {
    email: 'admin@campusprint.de',
    password: '123'
};

export function login(email: string, pass: string): boolean {
    if (email === MOCK_ADMIN.email && pass === MOCK_ADMIN.password) {
        setCookie(COOKIE_NAME, 'true', 1);
        return true;
    }
    return false;
}

export function logout() {
    deleteCookie(COOKIE_NAME);
    // Redirect to login
    window.location.href = 'adminLogin.html';
}

export function isAuthenticated(): boolean {
    return getCookie(COOKIE_NAME) === 'true';
}

export function requireAuth() {
    if (!isAuthenticated()) {
        console.warn("Zugriff verweigert. Redirect zum Login.");
        window.location.href = 'adminLogin.html';
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
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        
        if (c.indexOf(nameEQ) == 0) {
            // Decodierfunktion required for email
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

export function deleteCookie(name: string) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}