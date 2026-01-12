const TOKEN_KEY = 'admin_token';

export interface LoginResponse {
    token: string;
    email: string;
    role: string;
}

export async function login(email: string, password: string): Promise<boolean> {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data: LoginResponse = await response.json();
            localStorage.setItem(TOKEN_KEY, data.token);
            localStorage.setItem('admin_email', data.email);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Login failed:', error);
        return false;
    }
}

export async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST'
        });
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('admin_email');
    window.location.href = 'adminLogin.html';
}

export function isAuthenticated(): boolean {
    const token = getToken();
    return token !== null;
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function requireAuth() {
    if (!isAuthenticated()) {
        console.warn("Zugriff verweigert. Redirect zum Login.");
        window.location.href = 'adminLogin.html';
    }
}

export function getAuthHeaders(): { Authorization?: string } {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
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
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}
