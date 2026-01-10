package thl.campusprint.admin;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import thl.campusprint.users.UsersRepo;

import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AdminAuthService {

    private final UsersRepo usersRepo;
    private final JdbcTemplate jdbc;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom rnd = new SecureRandom();

    public AdminAuthService(UsersRepo usersRepo, JdbcTemplate jdbc) {
        this.usersRepo = usersRepo;
        this.jdbc = jdbc;
    }

    public Optional<String> login(String email, String rawPassword) {
        var userOpt = usersRepo.findByEmail(email);
        if (userOpt.isEmpty()) return Optional.empty();

        var u = userOpt.get();

        // only admin
        if (u.role() == null || !"admin".equalsIgnoreCase(u.role())) return Optional.empty();

        // password must be not null
        if (u.passwordHash() == null) return Optional.empty();

        // BCrypt check
        if (!encoder.matches(rawPassword, u.passwordHash())) return Optional.empty();

        String token = generateToken();
        jdbc.update(
                "insert into ADMIN_SESSION(TOKEN, USER_ID, CREATED_AT) values (?, ?, ?)",
                token, u.id(), Timestamp.from(Instant.now())
        );
        return Optional.of(token);
    }

    public boolean isValid(String token) {
        if (token == null || token.isBlank()) return false;
        Integer count = jdbc.queryForObject(
                "select count(*) from ADMIN_SESSION where TOKEN = ?",
                Integer.class, token
        );
        return count != null && count > 0;
    }

    public void logout(String token) {
        if (token == null || token.isBlank()) return;
        jdbc.update("delete from ADMIN_SESSION where TOKEN = ?", token);
    }

    private String generateToken() {
        byte[] b = new byte[32]; // 64 hex chars
        rnd.nextBytes(b);
        return HexFormat.of().formatHex(b);
    }
}