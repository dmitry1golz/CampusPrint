# CampusPrint

## Projekt-Setup

Anleitung zur Einrichtung des CampusPrint Projekts in VSCodium und IntelliJ IDEA.

---

### 1. Technische Voraussetzungen

Stellen Sie vor dem Klonen des Repositorys sicher, dass folgende Kernkomponenten auf Ihrem System installiert sind:

| Komponente | Zweck | Version | Prüfbefehl |
| :--- | :--- | :--- | :--- |
| **Java SDK** | Backend-Laufzeitumgebung | **21** oder höher | `java -version` |
| **Node.js** | TypeScript Kompilierung | Aktuelle LTS | `node -v` |

#### VSCodium/VS Code Erweiterungen

Für eine reibungslose Backend-Entwicklung in VSCodium ist die Installation folgender Erweiterung erforderlich:

* **Extension Pack for Java** (Enthält Debugging- und Sprachunterstützung)

---

### 2. Konfiguration der Umgebungsvariablen

Der Betrieb der Anwendung erfordert die korrekte Einstellung von **Umgebungsvariablen**, um den Modus (Entwicklung oder Produktion) und die Datenbankverbindung zu steuern.

#### Profile-Aktivierung

| Modus | Variable | Wert |
| :--- | :--- | :--- |
| **Entwicklung (DEV)** | `SPRING_PROFILES_ACTIVE` | `dev` |
| **Produktion (PROD)** | `SPRING_PROFILES_ACTIVE` | `prod` |

#### Datenbank-Zugangsdaten (für PROD)

Für den Produktionsbetrieb müssen Sie die folgenden Variablen setzen:

* `DB_NAME`
* `DB_HOST`
* `DB_PORT`
* `DB_USER`
* `DB_PASSWORD`

---

### 3. Setup in den Entwicklungsumgebungen

Das Setzen dieser Variablen kann direkt über die jeweiligen Startkonfigurationen der IDEs erfolgen.

| IDE | Ziel | Konfigurationsdatei / Menü |
| :--- | :--- | :--- |
| **VSCodium** | Umgebungsvariablen (`env`) und Pre-Tasks (`preLaunchTask`) | Bearbeiten Sie die Vorlagendatei: **`.vscode/launch.json`** |
| **IntelliJ IDEA** | Profile und Umgebungsvariablen | Zugriff über das Menü: **Run/Debug Configurations** |

> **Hinweis zu Vorlagen:** In beiden IDEs existieren Konfigurations- oder Vorlagendateien, die als Basis für Ihre lokale Startkonfiguration dienen. Passen Sie diese an, um Ihre lokalen Pfade und Umgebungsvariablen zu verwenden.

