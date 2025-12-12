
-----

# Projekt Setup Guide: CampusPrint (VSCodium)

Diese Anleitung beschreibt, wie wir das Projekt (Spring Boot Backend + TypeScript Frontend) in VSCodium eingerichtet haben, damit Datenbank und Frontend-Kompilierung sauber laufen.

## 1\. Voraussetzungen

Stelle sicher, dass folgende Dinge installiert sind:

  * **Java SDK:** (Version 21 oder höher, passend zum Projekt).
  * **Node.js:** (Für den TypeScript Compiler). Prüfen mit `node -v`.
  * **VSCodium Extensions:**
      * *Extension Pack for Java* (Backend).
      * *Live Server* (Optional, für reines HTML-Preview).

-----

## 2\. Backend & Datenbank Setup (H2)

Damit Spring Boot startet und nicht mit einem `DataSource` Fehler abstürzt, muss die Datenbank konfiguriert sein. Wir nutzen **H2 (In-Memory)** für die Entwicklung.

Bearbeite die Datei: `src/main/resources/application.properties`

Füge folgenden Inhalt ein:

```properties
# H2 Datenbank Konfiguration
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect

# H2 Konsole aktivieren (unter /h2-console erreichbar)
spring.h2.console.enabled=true

# JPA/Hibernate Einstellungen
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
```

*Info: Die Datenbank ist unter `http://localhost:8080/h2-console` erreichbar. JDBC URL ist `jdbc:h2:mem:testdb`, User `sa`, kein Passwort.*

-----

## 3\. Frontend Installation (TypeScript)

Öffne das Projekt-Terminal in VSCodium und installiere TypeScript lokal (nur einmalig nötig):

```bash
# Erstellt package.json (falls nicht vorhanden)
npm init -y

# Installiert TypeScript als Entwickler-Abhängigkeit
npm install typescript --save-dev
```

-----

## 4\. TypeScript Konfiguration (`tsconfig.json`)

Erstelle (oder bearbeite) die Datei: `src/main/resources/tsconfig.json`

Diese Konfiguration trennt deinen TypeScript-Code vom generierten JavaScript-Code.

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ES2015",
    "lib": ["dom", "es6"],
    "strict": false,
    "moduleResolution": "node",
    "esModuleInterop": true,
    
    // WICHTIG: Trennung von Quellcode und generiertem Code
    "rootDir": "./static/scripts",   // Hier liegen deine .ts Dateien (Quelle)
    "outDir": "./static/js"          // Hier landen die generierten .js Dateien (Ziel)
  },
  
  // Sagt dem Compiler, wo er suchen soll (Relativ zur tsconfig.json)
  "include": ["static/scripts/**/*"],
  "exclude": ["node_modules", "static/js"]
}
```

### Die Ordnerstruktur dazu:

```text
src/main/resources/static/
├── scripts/       <-- Hier arbeitest DU (admin.ts, login.ts)
└── js/            <-- Hier generiert der Computer automatisch (admin.js, login.js)
```

-----

## 5\. HTML Einbindung

Browser verstehen kein TypeScript. Du musst immer die **generierte JavaScript-Datei** einbinden.

In deiner HTML-Datei (z.B. `admin.html`):

```html
<script type="module" src="js/admin.js"></script>
```

-----

## 6\. Der Workflow (Starten)

Damit alles funktioniert, musst du zwei Dinge tun:

### A. Backend starten

Starte die Spring Boot Application ganz normal über die "Run"-Funktion in VSCodium (Datei: `CampusPrintApplication.java`).
\-\> Der Server läuft auf `http://localhost:8080`.

### B. Frontend-Compiler starten (Der "Watcher")

Damit deine Änderungen an `.ts` Dateien sofort in `.js` umgewandelt werden, öffne ein **separates Terminal** in VSCodium und starte den Watch-Mode:

```bash
# Befehl im Hauptverzeichnis ausführen:
npx tsc -p src/main/resources/tsconfig.json --watch
```

*Solange dieses Terminal läuft, werden deine Änderungen sofort übersetzt.*

-----

## 7\. Git sauber halten (`.gitignore`)

Da die `.js` Dateien automatisch aus den `.ts` Dateien generiert werden, sollten wir sie **nicht** in Git hochladen.

Füge folgende Zeile zu deiner `.gitignore` hinzu:

```text
# Ignoriere generierte JavaScript Dateien im static Ordner
src/main/resources/static/js/
```

-----

## 8\. Fehlerbehebung

| Fehlerbild | Lösung |
| :--- | :--- |
| **App stürzt beim Start ab** (`Failed to configure a DataSource`) | Siehe Punkt 2: `application.properties` prüfen. |
| **MIME-Type Error** (`video/mp2t`) im Browser | Im HTML `<script src="js/dateiname.js">` nutzen (Punkt 5). |
| **404 Error** für Scripts | Läuft `npx tsc --watch`? Stimmt der Pfad im HTML? |
| **TS18003: No inputs found** | Prüfe `include` Pfad in der `tsconfig.json` (Punkt 4). |