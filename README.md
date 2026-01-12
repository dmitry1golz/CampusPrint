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

Here is the text formatted into Markdown.

### What is `schema-mysql.sql` Responsible For?

The `schema-mysql.sql` file defines the complete database structure for MariaDB/MySQL production deployments. It's responsible for:

1. **Creating All Tables**
* `users` - Authentication table for admin and regular users
* `devices` - Available printers, laser cutters, and equipment
* `print_jobs` - Print job configuration and settings
* `bookings` - Booking records with timestamps and status


2. **Defining Constraints**
* Primary keys for each table
* Foreign key relationships (e.g., `bookings` → `users`, `print_jobs` → `devices`)
* Cascade rules (`ON DELETE CASCADE`, `ON UPDATE CASCADE`)
* Unique constraints (e.g., `users.email` must be unique)


3. **Setting Data Types**
* `ENUM` types for status fields (Available/Unavailable, pending/confirmed/etc.)
* JSON data stored as `TEXT` (MariaDB doesn't support JSON natively)
* UUID columns stored as `VARCHAR(36)`
* Proper timestamp handling with auto-update


4. **Optimization**
* Indexes on frequently queried columns (`user_id`, `print_job`, `status`, `time` fields)
* InnoDB engine for transaction support
* UTF8MB4 charset for Unicode support


5. **Database Engine Configuration**
* `SET default_storage_engine=InnoDB` - MariaDB-specific directive
* `SET NAMES utf8mb4` - Proper charset configuration



#### Why Two Different Schema Files?

| File | Purpose | When Used |
| --- | --- | --- |
| `schema-mysql.sql` | Production MariaDB database | Loaded automatically when Spring detects MySQL/MariaDB driver |
| No schema file | Development H2 database | Hibernate creates tables automatically (`ddl-auto=update`) |

The file was renamed from `schema.sql` to `schema-mysql.sql` to prevent H2 from trying to execute MariaDB-specific commands (like `SET default_storage_engine=InnoDB`), which would cause syntax errors in dev mode.

---
