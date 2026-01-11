// services/auth-service.ts

// cookie name on the backend (in the controller it was "ADMIN_SESSION")
const BACKEND_COOKIE = "ADMIN_SESSION";

// if the front distributes Spring on 8090 — leave it blank
// if the front is separate (vite/5173) — set "http://localhost:8090"
const API_BASE = "";
const API = "/api/auth";

type ApiResponse = { ok: boolean; error?: string | null };

async function api<T>(path: string, options: RequestInit = {}): Promise<{ status: number; data: T | null }> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        credentials: "include", // required for cookies
    });

    // We try to read JSON, but we don't crash if there is no body.
    const text = await res.text();
    const data = text ? (JSON.parse(text) as T) : null;

    return {status: res.status, data};
}

export async function login(email: string, pass: string): Promise<boolean> {
    const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password: pass })
    });
    return res.ok;
}

export async function logout(): Promise<void> {
    await fetch(`${API}/logout`, { method: "POST", credentials: "include" });
    window.location.href = "adminLogin.html";
}

export async function isAuthenticated(): Promise<boolean> {
    const res = await fetch(`${API}/me`, { credentials: "include" });
    return res.ok;
}

export async function requireAuth(): Promise<void> {
    if (!(await isAuthenticated())) {
        console.warn("Zugriff verweigert. Redirect zum Login.");
        window.location.href = 'adminLogin.html';
    }
}
