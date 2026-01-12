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
- Java version: 21
- Spring Boot version: 3.4.1
- TypeScript target: ES6
- Database: MySQL/MariaDB (production), H2 (in-memory for tests)
- Port: 8080 (production), 8090 (development)
- Default admin credentials: `admin@campusprint.de` / `admin`
- Admin password hash (BCrypt): `$2a$10$N9qo8kLO2gxQftK6yIqJ1Wx5BQzYb9yP8rOYl5ZzKZ6x7Z`
- Always run linters and tests before committing: `npm run lint:all && ./mvnw test`

## Authentication System (JWT Implementation - IN PROGRESS)

### Backend Implementation
- **JWT Utilities**: `JwtUtil.java` - Generate/validate JWT tokens
- **JWT Filter**: `JwtAuthenticationFilter.java` - Intercepts requests and validates tokens
- **Security Config**: `SecurityConfig.java` - Spring Security configuration with @PreAuthorize
- **Auth Controller**: `AuthController.java` - Login/logout endpoints (`/api/auth/login`, `/api/auth/logout`)
- **User Details Service**: `CustomUserDetailsService.java` - Load users for authentication
- **Password Encoder**: `BCryptPasswordEncoder` bean (BCrypt hashing)

### Frontend Implementation
- **Auth Service**: `authService.ts` - JWT-based authentication
  - `login(email, password)` - Calls `/api/auth/login`, stores token in localStorage
  - `logout()` - Calls `/api/auth/logout`, clears localStorage and cookies
  - `isAuthenticated()` - Checks for valid JWT token in localStorage
  - `getToken()` - Retrieves token from localStorage
  - `getAuthHeaders()` - Returns `Authorization: Bearer <token>` header
- **API Service Updates**:
  - `deviceService.ts` - Added Authorization headers to all admin operations
  - `bookingService.ts` - Added Authorization headers to booking status updates
  - `adminLogin.ts` - Updated to use async/await for login

### Protected Endpoints (Require ADMIN Role)
- **Device Management**:
  - `POST /api/devices` - Create/update device (`@PreAuthorize`)
  - `DELETE /api/devices/{id}` - Delete device (`@PreAuthorize`)
- **Booking Management**:
  - `POST /api/bookings/status` - Change booking status (`@PreAuthorize`)

### Database Setup
- **Default Admin User** (`data.sql`):
  - Email: `admin@campusprint.de`
  - Password: `admin` (BCrypt hash: `$2a$10$N9qo8kLO2gxQftK6yIqJ1Wx5BQzYb9yP8rOYl5ZzKZ6x7Z`)
  - Role: `admin`
- **Users Table Schema**:
  - `idusers` (UUID, primary key)
  - `email` (VARCHAR 60, unique)
  - `password` (VARCHAR 100, BCrypt hashed)
  - `role` (ENUM: 'user', 'admin')

### Current Status
- ⚠️ **Lombok Compilation Issue**: Java 25 compatibility issues with edge-SNAPSHOT Lombok
  - Impact: Entity methods may show as undefined in IDE (compiles successfully)
  - Workaround: Using edge-SNAPSHOT version in pom.xml
  - Recommendation: Test with Java 21 for production builds
- ✅ **Backend**: All authentication code created (JWT, SecurityConfig, AuthController, etc.)
- ✅ **Frontend**: Auth services updated to use JWT tokens and localStorage
- ✅ **Database**: Default admin user with BCrypt hashed password

### TODOs Remaining
- ⚠️ **Fix Lombok compilation** - Address Java 25/Lombok compatibility
- **Test Authentication Flow** - Login with admin credentials, verify JWT token, test protected endpoints
- **Update Tests** - Modify controller tests after entity changes
- **Add Integration Tests** - Authentication end-to-end with Testcontainers