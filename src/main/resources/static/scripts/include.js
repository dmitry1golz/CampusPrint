document.addEventListener('DOMContentLoaded', () => {
    const includes = document.querySelectorAll('[data-include]');

    includes.forEach(async (elem) => {
        const file = elem.getAttribute('data-include');
        if (file) {
            try {
                const res = await fetch(file);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const html = await res.text();
                elem.innerHTML = html;
            } catch (err) {
                console.error(`Fehler beim Laden von ${file}:`, err);
                elem.innerHTML = `<p style="color:red;">Fehler beim Laden von ${file}</p>`;
            }
        }
    });
});
