package thl.campusprint;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import javax.sql.DataSource;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

@SpringBootTest
@Testcontainers
class CampusPrintDatabaseTests {

    // Dein Podman-kompatibler Container Setup
    @Container
    static MySQLContainer<?> mysql =
            new MySQLContainer<>(
                            DockerImageName.parse("docker.io/library/mysql:8.0")
                                    .asCompatibleSubstituteFor("mysql"))
                    .withDatabaseName("CampusPrint");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired private DataSource dataSource;

    @Test
    @DisplayName("1. User-Daten: Prüfen auf Anzahl und Admin-Existenz")
    void verifyUsersLoaded() throws SQLException {
        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement()) {

            // Check 1: Sind genau 3 User drin?
            ResultSet rsCount = stmt.executeQuery("SELECT count(*) FROM `users`");
            rsCount.next();
            int count = rsCount.getInt(1);
            assertThat(count).as("Anzahl der User in DB").isEqualTo(3);

            // Check 2: Ist der Admin korrekt angelegt?
            PreparedStatement ps =
                    conn.prepareStatement("SELECT role FROM `users` WHERE email = ?");
            ps.setString(1, "admin@campusprint.de");
            ResultSet rsAdmin = ps.executeQuery();

            assertThat(rsAdmin.next()).as("Admin User muss existieren").isTrue();
            assertThat(rsAdmin.getString("role")).isEqualTo("admin");
        }
    }

    @Test
    @DisplayName("2. Geräte: Prüfen auf JSON-Inhalte und Anzahl")
    void verifyDevicesAndJson() throws SQLException {
        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement()) {

            // Check 1: Anzahl der Geräte (Du hast IDs 1,2,3,4,5,6,8 -> also 7 Stück)
            ResultSet rs = stmt.executeQuery("SELECT count(*) FROM `devices`");
            rs.next();
            assertThat(rs.getInt(1)).as("Anzahl der Devices").isEqualTo(7);

            // Check 2: JSON Daten lesen (Ultimaker S5)
            // Wir prüfen, ob die 'print_options' als Text lesbar sind
            ResultSet rsDevice =
                    stmt.executeQuery(
                            "SELECT print_options FROM `devices` WHERE name = 'Ultimaker S5'");
            rsDevice.next();
            String jsonOptions = rsDevice.getString("print_options");

            assertThat(jsonOptions).contains("FDM");
            assertThat(jsonOptions).contains("\"color_hex\": \"#FFFFFF\""); // Prüft auf PLA Weiß
        }
    }

    @Test
    @DisplayName("3. Buchungen: Komplexe Verknüpfung User -> Booking -> Job")
    void verifyBookingLogic() throws SQLException {
        // Szenario: Wir suchen die Buchung, die wegen "Waffen-Replik" abgelehnt wurde.
        // Das testet JOINs über 3 Tabellen (users, bookings, print_jobs).

        String query =
                """
                    SELECT
                        b.status,
                        b.admin_message,
                        u.email,
                        p.device
                    FROM `bookings` b
                    JOIN `users` u ON b.user_id = u.idusers
                    JOIN `print_jobs` p ON b.print_job = p.idprintjob
                    WHERE u.email = 'extern@campusprint.de'
                    AND b.admin_message IS NOT NULL
                """;

        try (Connection conn = dataSource.getConnection();
                Statement stmt = conn.createStatement();
                ResultSet rs = stmt.executeQuery(query)) {

            assertThat(rs.next()).as("Sollte die abgelehne Buchung finden").isTrue();

            // Prüfungen basierend auf deinen Insert-Daten:
            // INSERT INTO bookings ... VALUES (..., status 3, ..., 'Drucken von Waffen-Repliken ist
            // laut
            // Nutzungsordnung untersagt.')

            assertThat(rs.getInt("status")).isEqualTo(3); // 3 = Rejected?
            assertThat(rs.getString("admin_message")).contains("Waffen-Repliken");
            assertThat(rs.getInt("device")).isEqualTo(1); // War für Ultimaker S5 (ID 1)
        }
    }
}
