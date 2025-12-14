# CampusPrint

## Projekt Setup Guide:

Anleitung zur Einrichtung des CampusPrint Projekts in VSCodium und IntelliJ IDEA.

### Voraussetzungen
Stelle sicher, dass folgende Dinge installiert sind:

* **Java SDK:** (Version 21 oder höher, passend zum Projekt).
* **Node.js:** (Für den TypeScript Compiler). Prüfen mit `node -v`.
* **VSCodium Extensions:**
  * *Extension Pack for Java* (Backend).
* **IntelliJ IDEA:** (Community oder Ultimate Edition).

### Umgebungsvariablen
* Für den Dev Mode: **`SPRING_PROFILES_ACTIVE=dev`** setzen.
* Für den Prod Mode: **`DB_NAME`**, **`DB_HOST`**, **`DB_PORT`**, **`DB_USER`**, **`DB_PASSWORD`** setzen.

Das Setzen kann man für VSCodium in der `launch.json` machen oder in IntelliJ IDEA in den Run/Debug Konfigurationen.

Für beide IDEs gibt es Vorlagen in den jeweiligen Konfigurationsdateien:
* **VSCodium:** `.vscode/launch.json`
* **IntelliJ IDEA:** Run/Debug Configurations (über das Menü erreichbar)