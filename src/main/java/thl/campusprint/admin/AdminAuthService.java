package thl.campusprint.admin;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import thl.campusprint.repositories.UserRepository;

import java.security.SecureRandom;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AdminAuthService {

    private final UserRepository userRepo;
    private final JdbcTemplate jdbc;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final SecureRandom rnd = new SecureRandom();

    public AdminAuthService(UserRepository userRepo, JdbcTemplate jdbc) {
        this.userRepo = userRepo;
        this.jdbc = jdbc;
    }

    public Optional<String> login(String email, String rawPassword) {
        var userOpt = userRepo.findByEmail(email);
        if (userOpt.isEmpty()) return Optional.empty();

        var u = userOpt.get();

        // only admin
        if (u.getRole() == null || !"admin".equalsIgnoreCase(String.valueOf(u.getRole()))) return Optional.empty();

        // password must be not null
        if (u.getPassword() == null) return Optional.empty();

        // BCrypt check
        if (!encoder.matches(rawPassword, u.getPassword())) return Optional.empty();

        String token = generateToken();
        jdbc.update(
                "insert into ADMIN_SESSION(TOKEN, USER_ID, CREATED_AT) values (?, ?, ?)",
                token, u.getId(), Timestamp.from(Instant.now())
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