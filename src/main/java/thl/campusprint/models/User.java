package thl.campusprint.models;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "idusers", updatable = false, nullable = false, length = 36)
    @JdbcTypeCode(java.sql.Types.VARCHAR)
    private UUID id;

    @Column(nullable = false, length = 60, unique = true)
    private String email;

    @Column(length = 100)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('user', 'admin') DEFAULT 'user'")
    private UserRole role = UserRole.user;
}
