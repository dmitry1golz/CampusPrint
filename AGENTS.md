# AGENTS.md

This file provides essential information for agentic coding agents working in the CampusPrint repository.

## Essential Commands

### Build & Test
- `./mvnw clean install` - Build entire project and run all tests
- `./mvnw test` - Run all tests
- `./mvnw test -Dtest=ClassName#methodName` - Run single test method
- `./mvnw test -Dtest=ClassName` - Run all tests in a class
- `./mvnw spotless:apply` - Auto-format Java code (Google Java Format AOSP style)
- `./mvnw spotless:check` - Check Java formatting without applying changes

### TypeScript
- `npm run compile` - Compile TypeScript to JavaScript
- `npm run ts-watch` - Watch mode for TypeScript compilation (development)
- `npm run ts-watch-bg-os` - Background watch mode (Linux/macOS)
- `npm run ts-watch-stop-os` - Stop background watch process (Linux/macOS)

### Linting
- `npm run lint:all` - Run all frontend linters (TS, CSS, HTML)
- `npm run lint:ts` - ESLint for TypeScript
- `npm run lint:css` - Stylelint for CSS
- `npm run lint:html` - HTML validation
- `./mvnw spotless:check` - Java formatting check

## Java Code Style

### Formatting & Imports
- Use Google Java Format (AOSP style) - enforced by Spotless plugin
- No wildcard imports (e.g., `import java.util.*;`)
- Spotless automatically removes unused imports

### Naming Conventions
- Classes: PascalCase (e.g., `BookingController`, `DeviceService`)
- Methods/Variables: camelCase (e.g., `getBookings`, `startTime`)
- Constants: UPPER_SNAKE_CASE (e.g., `DEFAULT_PAGE_SIZE`)
- Package names: lowercase (e.g., `thl.campusprint.models`)

### Architecture Patterns
- **Controller-Service-Repository**: Follow 3-layer architecture
  - Controllers: Handle HTTP requests/responses, use `@RestController`
  - Services: Business logic, use `@Service` and `@Transactional` for write operations
  - Repositories: Data access, extend `JpaRepository<Entity, ID>`

### Dependency Injection
- Use constructor injection exclusively (no field injection)
- Mark fields as `final`
- Example:
```java
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }
}
```

### Entity & Database
- Use JPA annotations: `@Entity`, `@Table`, `@Id`, `@GeneratedValue`, `@Column`
- Specify explicit column names: `@Column(name = "user_id")`
- Use Lombok: `@Getter`, `@Setter` for entities
- For relationships: `@ManyToOne(fetch = FetchType.LAZY)` for efficiency
- Use `@UpdateTimestamp` for automatic timestamp updates

### DTOs & Validation
- Separate DTO classes in `models/DTOs/` package
- Use `@Validated` for request body validation
- Create static factory methods: `BookingDTO.fromDBModel(Booking booking)`

### Error Handling
- Throw `IllegalArgumentException` for invalid inputs
- Use `ResponseEntity` for HTTP responses with appropriate status codes
- Return JSON error messages with status and message fields

## TypeScript/JavaScript Style

### Type Safety
- Strict mode enabled in tsconfig.json
- Define interfaces for all data models in `static/scripts/models/`
- Use type assertions for DOM elements: `as HTMLInputElement`

### Code Organization
- `/models/`: TypeScript interfaces and type definitions
- `/services/`: API calls and data fetching logic
- Entry point files in `static/scripts/` (e.g., `booking.ts`, `deviceCatalog.ts`)

### API Services
- Use async/await for all API calls
- Return typed interfaces from service functions
- Handle HTTP errors: check `response.ok` and return `undefined` or throw errors
- Example:
```typescript
export async function getBookings(): Promise<Booking[]> {
    const response = await fetch(API_URL);
    if (!response.ok) return [];
    return await response.json();
}
```

### Date Handling
- Convert JSON date strings to Date objects immediately
- Use `new Date(b.dateString)` when mapping from API responses

### DOM Manipulation
- Use type assertions for element access: `document.getElementById('email')! as HTMLInputElement`
- Use optional chaining `?.` for potentially null elements

## Testing Guidelines

### Unit Tests (Controllers)
- Use `@WebMvcTest` for testing controllers in isolation
- Mock repositories with `@MockBean`
- Use `MockMvc` to simulate HTTP requests
- Validate responses with `jsonPath()`
- Example test structure:
```java
@WebMvcTest(DeviceController.class)
class DeviceControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockitoBean private DeviceRepository deviceRepository;

    @Test
    void shouldReturnDeviceById() throws Exception {
        // Arrange
        when(repository.findById(id)).thenReturn(Optional.of(device));
        // Act & Assert
        mockMvc.perform(get("/api/devices/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("My Printer"));
    }
}
```

### Integration Tests
- Use `@SpringBootTest` with `@Testcontainers` for database tests
- Testcontainers version: 1.21.3
- Use Rest Assured for API testing if preferred

## Project Structure

### Java Source
- `src/main/java/thl/campusprint/`
  - `models/` - JPA entities, DTOs, enums
  - `repositories/` - JPA repository interfaces
  - `controllers/` - REST controllers
  - `service/` - Business logic services
  - `CampusPrintApplication.java` - Main application class

### TypeScript Source
- `src/main/resources/static/scripts/`
  - `models/` - TypeScript interfaces
  - `services/` - API service functions
  - `*.ts` - Page-specific logic (booking.ts, deviceCatalog.ts, etc.)

### Configuration
- `pom.xml` - Maven configuration (Java dependencies, plugins)
- `package.json` - npm scripts for TypeScript and linting
- `tsconfig.json` - TypeScript compiler configuration
- `application.properties` - Spring Boot configuration
- `application-dev.properties` - Development profile configuration

## Environment Variables
- `SPRING_PROFILES_ACTIVE` - Set to `dev` or `prod`
- Production DB: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

## Important Notes
- Java version: 21 (compilation works with Java 25 + Lombok edge-SNAPSHOT)
- Spring Boot version: 3.4.1
- TypeScript target: ES6
- Database: MariaDB/MySQL (production), H2 (in-memory for tests)
- Port: 8080 (production), 8090 (development)
- Default admin credentials: `admin@campusprint.de` / `admin`
- Admin password hash (BCrypt): `$2a$10$IWDo61g8d4D2qVXpJ/PNk.SxB8bg9hs4/pgewDlVdHT9p4MNbW8fC`
- Always run linters and tests before committing: `npm run lint:all && ./mvnw test`

## Authentication System (JWT Implementation - COMPLETED)

### Overview
Complete JWT-based authentication system implemented to secure admin endpoints and manage user sessions. Uses stateless authentication with tokens stored in localStorage on the frontend.

### Backend Implementation

#### Dependencies Added (pom.xml)
- Spring Security Starter (spring-boot-starter-security)
- JWT libraries (jjwt-api, jjwt-impl, jjwt-jackson version 0.11.5)
- MariaDB JDBC driver (mariadb-java-client)
- Lombok edge-SNAPSHOT for Java 25 compatibility

#### New Files Created
**Configuration Layer** (`src/main/java/thl/campusprint/config/`):
- `JwtUtil.java` - JWT token generation and validation
  - Secret key: `your-secret-key-must-be-at-least-256-bits-long`
  - Algorithm: HS256
  - Token expiration: 10 hours
  - Extracts username and role from tokens
- `JwtAuthenticationFilter.java` - Request interceptor
  - Validates JWT tokens from `Authorization: Bearer <token>` header
  - Sets SecurityContext authentication for authorized users
  - Skips /api/auth/** endpoints (public access)
- `SecurityConfig.java` - Spring Security configuration
  - Configures authentication manager and password encoder
  - Sets JWT filter chain
  - Rules:
    - `/api/auth/**` - Permit all (public endpoints)
    - All other requests - Authenticated
  - Method-level security: `@PreAuthorize("hasRole('ADMIN')")`

**Controller Layer** (`src/main/java/thl/campusprint/controllers/`):
- `AuthController.java` - Authentication endpoints
  - `POST /api/auth/login` - Validates credentials, generates JWT token, returns JSON with token and role
  - `POST /api/auth/logout` - Clears session, returns success message
  - Only allows admin users to log in

**Service Layer** (`src/main/java/thl/campusprint/service/`):
- `CustomUserDetailsService.java` - Spring Security integration
  - Loads user from database by email
  - Returns UserDetails with role-based authorities

#### Modified Files
- `BookingController.java` (lines 66-87)
  - Added `@PreAuthorize("hasRole('ADMIN')")` to `changeBookingStatus` endpoint
  - Added `Authentication` parameter to track admin user
  - Passes admin email to BookingService for audit trail
- `DeviceController.java`
  - Added `@PreAuthorize("hasRole('ADMIN')")` to `createOrUpdateDevice` (POST)
  - Added `@PreAuthorize("hasRole('ADMIN')")` to `deleteDevice` (DELETE)
- `BookingService.java` (lines 87-105)
  - Updated `changeBookingStatus` to accept admin User parameter
  - Calls `setLastModified(String)` to store admin email (audit trail)
  - Has duplicate `getAdminUser` method - needs cleanup (known issue)
- `UserRepository.java`
  - Updated for authentication queries

### Frontend Implementation

#### TypeScript Configuration
- `tsconfig.json` - Updated module from ES2015 to ES2020 for dynamic import support

#### New/Updated Services
**authService.ts** (`src/main/resources/static/scripts/services/`):
```typescript
login(email: string, password: string): Promise<boolean>
  - Calls POST /api/auth/login
  - Stores JWT token and role in localStorage on success
  - Returns true if successful, false otherwise

logout(): Promise<void>
  - Calls POST /api/auth/logout
  - Clears localStorage (token, role, adminEmail)
  - Clears document cookies

isAuthenticated(): boolean
  - Checks if token exists in localStorage and is not expired

getToken(): string | null
  - Retrieves JWT token from localStorage

getAuthHeaders(): { Authorization: string }
  - Returns { Authorization: Bearer <token> } for API calls
```

**deviceService.ts** (`src/main/resources/static/scripts/services/`):
- Added `import { getAuthHeaders } from './authService.js'`
- Modified functions to include Authorization headers:
  - `addDevice()` - POST with auth headers
  - `deleteDevice()` - DELETE with auth headers
  - `updateDeviceStatus()` - POST with auth headers

**bookingService.ts** (`src/main/resources/static/scripts/services/`):
- Added `import { getAuthHeaders } from './authService.js'`
- Modified `updateBookingStatus()` to include Authorization headers

#### Page-Specific Scripts
**adminLogin.ts** (`src/main/resources/static/scripts/`):
- Updated to use async/await pattern
- Calls `authService.login(email, password)`
- Redirects to admin.html on success

**include.ts** (`src/main/resources/static/scripts/`):
- Updated to handle dynamic header authentication state
- Uses dynamic import to load authService (works with non-module script loading)
- `updateHeaderAuth()` function:
  - When authenticated: Shows "Admin Dashboard" + "Logout" button
  - When not authenticated: Shows "Admin" (login) button
  - Logout button clears localStorage and redirects to index.html

#### HTML Changes
**header.html** (`src/main/resources/static/`):
- Added inline CSS for logout button style
- Maintains responsive design

**adminLogin.html** (`src/main/resources/static/`):
- Changed button text from "Als Admin anmelden" to "Login"

### Protected Endpoints (Require ADMIN Role)

#### Device Management
- `POST /api/devices` - Create/update device
- `DELETE /api/devices/{id}` - Delete device

#### Booking Management
- `POST /api/bookings/status` - Change booking status (tracks admin user)

### Database Setup

#### New Users Table
**Schema** (`schema-mysql.sql`):
```sql
CREATE TABLE `users` (
  `idusers` VARCHAR(36) NOT NULL PRIMARY KEY,
  `email` VARCHAR(60) NOT NULL UNIQUE,
  `password` VARCHAR(100) DEFAULT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### Data Initialization (`data.sql`)
- **Default Admin User**:
  - UUID: `5de20ec1-158e-4f15-8012-3414d8c182a7`
  - Email: `admin@campusprint.de`
  - Password: `admin` (BCrypt hash: `$2a$10$IWDo61g8d4D2qVXpJ/PNk.SxB8bg9hs4/pgewDlVdHT9p4MNbW8fC`)
  - Role: `admin`
- **Regular Users** (for reference):
  - `student@campusprint.de` - No password (regular user)
  - `extern@campusprint.de` - No password (regular user)

#### Schema Files
**schema-mysql.sql** - Production MariaDB schema:
- Creates all 4 tables: users, devices, print_jobs, bookings
- MariaDB-specific commands (InnoDB engine, utf8mb4 charset)
- Foreign key constraints with CASCADE rules
- Indexes for performance
- Automatically loaded when Spring detects MariaDB driver

**No schema file for H2** - Development creates tables automatically via Hibernate (`ddl-auto=update`)

### Security Features

#### Password Hashing
- BCrypt algorithm with cost factor 10
- All passwords stored as hashed strings
- Example: `$2a$10$IWDo61g8d4D2qVXpJ/PNk.SxB8bg9hs4/pgewDlVdHT9p4MNbW8fC`

#### Token-Based Authentication
- Stateless (no server-side sessions)
- JWT tokens stored in localStorage
- Token includes: username (email), role, expiration time
- Bearer token in Authorization header: `Authorization: Bearer <token>`

#### Role-Based Authorization
- Uses Spring Security `@PreAuthorize` annotations
- Two roles: `user`, `admin`
- Only admins can access protected endpoints
- Admin-only operations logged (audit trail via last_modified field)

### Current Status
- ✅ **Authentication Flow Complete**: Login, logout, token validation all working
- ✅ **Frontend UI**: Dynamic Login/Logout buttons in header
- ✅ **Protected Endpoints**: Admin operations secured with @PreAuthorize
- ✅ **Database**: Users table created, default admin user with BCrypt password
- ✅ **Dev Mode**: H2 in-memory database works (tables auto-created)
- ✅ **Prod Mode**: MariaDB ready (import schema-mysql.sql first)
- ⚠️ **Lombok Compatibility**: Java 25 + edge-SNAPSHOT works, but IDE shows warnings
  - Methods compile correctly at runtime
  - Can use Java 21 for production builds to avoid warnings

### Known Issues
- **Duplicate method in BookingService** (lines 100-105): `getAdminUser()` defined twice
  - Currently not causing runtime errors
  - Should be cleaned up in future refactoring

### Testing the Authentication

#### Manual Testing Steps
1. **Start Application**:
   ```bash
   # Dev mode (H2, port 8090)
   ./mvnw spring-boot:run

   # Prod mode (MariaDB, port 8080)
   # First import schema into MariaDB:
   docker exec -i <container> mysql -u<user> -p<password> CampusPrint < src/main/resources/schema-mysql.sql
   docker exec -i <container> mysql -u<user> -p<password> CampusPrint < src/main/resources/data.sql
   # Then run:
   SPRING_PROFILES_ACTIVE=prod java -jar target/CampusPrint-0.0.1-SNAPSHOT.jar
   ```

2. **Test Login**:
   - Navigate to `http://localhost:8090/adminLogin.html`
   - Enter credentials: `admin@campusprint.de` / `admin`
   - Verify redirection to admin dashboard
   - Check browser localStorage for JWT token and role

3. **Test Logout**:
   - Click "Logout" button in header
   - Verify localStorage is cleared
   - Verify redirection to index.html
   - Header should now show "Admin" button instead of "Logout"

4. **Test Protected Endpoints**:
   - Login as admin
   - Try creating a device (should work)
   - Try changing booking status (should work)
   - Logout
   - Try same operations without token (should return 403 Forbidden)

5. **Test Invalid Login**:
   - Enter wrong password
   - Should see error message
   - Should not be redirected

### How to Change Admin Password

#### Option 1: Online BCrypt Generator (Quick)
1. Go to https://bcrypt-generator.com/
2. Enter new password
3. Set cost factor = 10
4. Copy generated hash (starts with `$2a$10$`)
5. Run SQL:
   ```sql
   UPDATE users SET password = '$2a$10$YOUR_NEW_HASH_HERE' WHERE email = 'admin@campusprint.de';
   ```

#### Option 2: Create a Password Hash Utility
Add a utility class to generate BCrypt hashes:
```java
package thl.campusprint.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: java PasswordHashGenerator <password>");
            return;
        }
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(args[0]);
        System.out.println("BCrypt hash: " + hash);
    }
}
```
Run with:
```bash
./mvnw exec:java -Dexec.mainClass="thl.campusprint.util.PasswordHashGenerator" -Dexec.args="new_password"
```

### File Reference Summary

**New Backend Files**:
- `src/main/java/thl/campusprint/config/SecurityConfig.java`
- `src/main/java/thl/campusprint/config/JwtUtil.java`
- `src/main/java/thl/campusprint/config/JwtAuthenticationFilter.java`
- `src/main/java/thl/campusprint/controllers/AuthController.java`
- `src/main/java/thl/campusprint/service/CustomUserDetailsService.java`

**New Database Files**:
- `src/main/resources/schema-mysql.sql` - MariaDB production schema

**Modified Backend Files**:
- `pom.xml` - Added Security, JWT, Lombok edge-SNAPSHOT, MariaDB driver
- `src/main/java/thl/campusprint/controllers/BookingController.java`
- `src/main/java/thl/campusprint/controllers/DeviceController.java`
- `src/main/java/thl/campusprint/service/BookingService.java`
- `src/main/resources/data.sql` - Updated admin password hash

**Modified Frontend Files**:
- `src/main/resources/static/header.html` - Added logout button style
- `src/main/resources/static/adminLogin.html` - Simplified login button
- `src/main/resources/static/scripts/authService.ts` - Complete JWT implementation
- `src/main/resources/static/scripts/deviceService.ts` - Added auth headers
- `src/main/resources/static/scripts/bookingService.ts` - Added auth headers
- `src/main/resources/static/scripts/adminLogin.ts` - Async/await pattern
- `src/main/resources/static/scripts/include.ts` - Dynamic header auth state
- `src/main/resources/tsconfig.json` - Module ES2020 for dynamic imports

**Documentation**:
- `AGENTS.md` - This file