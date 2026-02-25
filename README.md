# CampusPrint 🖨️

**CampusPrint** is an all-in-one management system designed to streamline the use of printing resources across the university campus. Our team built this project to simplify how students interact with university hardware, providing a centralized platform for both standard and 3D printing tasks.

---

## 🌟 Key Features

### For Students (Users)
* **Equipment Selection:** Browse a list of available standard and 3D printers located on campus.
* **Flexible Configuration:** Set custom print parameters, choose specific dates, and book time slots.
* **Easy Identification:** Submit requests using your official university email address.
* **Booking Tracker:** View all personal print jobs and current booking statuses by simply entering your registered email.

### For Administrators (Admins)
* **Fleet Management:** Add, delete, and edit printer descriptions or technical settings via a password-protected panel.
* **Request Moderation:** Approve or reject incoming print requests in real-time.
* **Custom Feedback:** Provide specific reasons for rejection (text-based) to help users understand why a job was declined.
* **Secure Access:** Management features are restricted to authorized personnel via a secure login.

---

## 🛠 Technical Stack
* **Backend:** Java 21 (Spring Boot)
* **Frontend:** TypeScript / Node.js
* **Database:** MariaDB/MySQL (Production), H2 (Development)

---

## 🚀 Project Setup

Instructions for setting up the CampusPrint project in **VSCodium** and **IntelliJ IDEA**.

### 1. Technical Prerequisites

Before cloning the repository, ensure the following core components are installed on your system:

| Component | Purpose | Version | Check Command |
| :--- | :--- | :--- | :--- |
| **Java SDK** | Backend Runtime | **21** or higher | `java -version` |
| **Node.js** | TypeScript Compilation | Latest LTS | `node -v` |

#### VSCodium/VS Code Extensions
For smooth backend development in VSCodium, the following extension is required:
* **Extension Pack for Java** (Includes debugging and language support)

---

### 2. Environment Variables Configuration

Running the application requires setting **Environment Variables** to control the operational mode (Development vs. Production) and the database connection.

#### Profile Activation
| Mode | Variable | Value |
| :--- | :--- | :--- |
| **Development (DEV)** | `SPRING_PROFILES_ACTIVE` | `dev` |
| **Production (PROD)** | `SPRING_PROFILES_ACTIVE` | `prod` |

#### Database Credentials (Required for PROD)
For production environments, you must set the following variables:
* `DB_NAME`
* `DB_HOST`
* `DB_PORT`
* `DB_USER`
* `DB_PASSWORD`

---

### 3. Setup in Development Environments

These variables can be configured directly within your IDE's run configurations.

| IDE | Target | Config File / Menu |
| :--- | :--- | :--- |
| **VSCodium** | Env variables (`env`) and Pre-Tasks (`preLaunchTask`) | Edit the template: **`.vscode/launch.json`** |
| **IntelliJ IDEA** | Profiles and Env variables | Access via menu: **Run/Debug Configurations** |

> **Note on Templates:** Both IDEs contain configuration or template files that serve as a base for your local startup configuration. Adjust these to match your local paths and environment variables.

---

## 📂 Database Logic & Schema Management

### What is `schema-mysql.sql` Responsible For?

The `schema-mysql.sql` file defines the complete database structure for **MariaDB/MySQL** production deployments. It handles:

1. **Table Creation**
    * `users`: Authentication table for admin and regular users.
    * `devices`: Registry of available printers, laser cutters, and 3D equipment.
    * `print_jobs`: Specific job configuration and technical settings.
    * `bookings`: Booking records with timestamps, relations, and statuses.

2. **Defining Constraints**
    * Primary keys and Foreign Key relationships (e.g., `bookings` → `users`).
    * Cascade rules (`ON DELETE CASCADE`) to maintain data integrity.
    * Unique constraints for emails and critical IDs.

3. **Optimization & Data Types**
    * `ENUM` types for status fields (Pending, Confirmed, Rejected, etc.).
    * JSON data stored as `TEXT` for compatibility.
    * UUID columns stored as `VARCHAR(36)`.
    * Proper `UTF8MB4` charset support for Unicode characters.

#### Why Two Different Schema Approaches?

| File | Purpose | When Used |
| :--- | :--- | :--- |
| `schema-mysql.sql` | Production MariaDB database | Loaded automatically when Spring detects the MySQL driver. |
| **No schema file** | Development H2 database | Hibernate creates tables automatically (`ddl-auto=update`). |

> **Naming Note:** The file was renamed from `schema.sql` to `schema-mysql.sql` to prevent the H2 database (used in development) from attempting to execute MariaDB-specific commands (like `ENGINE=InnoDB`), which would otherwise cause syntax errors during startup.

---
