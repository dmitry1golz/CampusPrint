document.addEventListener('DOMContentLoaded', async () => {
    const includes = document.querySelectorAll('[data-include]');

    includes.forEach(async (elem) => {
        const file = elem.getAttribute('data-include');
        if (file) {
            try {
                const res = await fetch(file);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const html = await res.text();
                elem.innerHTML = html;
                
                if (file === 'header.html') {
                    const { isAuthenticated, logout } = await import('./services/authService.js');
                    updateHeaderAuth(isAuthenticated, logout);
                }
            } catch (err) {
                console.error(`Fehler beim Laden von ${file}:`, err);
                elem.innerHTML = `<p style="color:red;">Fehler beim Laden von ${file}</p>`;
            }
        }
    });
});

function updateHeaderAuth(isAuthenticated: () => boolean, logout: () => Promise<void>) {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const authenticated = isAuthenticated();

    if (authenticated) {
        navLinks.innerHTML = `
            <a href="myPrints.html" class="blue-button">Meine Drucke</a>
            <a href="deviceCatalog.html" class="blue-button">Katalog</a>
            <a href="admin.html" class="blue-button">Admin Dashboard</a>
            <button id="logout-btn" class="white-button">Logout</button>
        `;

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                await logout();
                window.location.href = 'index.html';
            });
        }
    } else {
        navLinks.innerHTML = `
            <a href="myPrints.html" class="blue-button">Meine Drucke</a>
            <a href="deviceCatalog.html" class="blue-button">Katalog</a>
            <a href="adminLogin.html" class="white-button">Admin</a>
        `;
    }
}
