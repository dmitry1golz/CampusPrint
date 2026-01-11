package thl.campusprint.controllers;


import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import thl.campusprint.models.User;
import thl.campusprint.repositories.UserRepository;
import thl.campusprint.security.JwtService;

@ResponseBody
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthController(UserRepository users, PasswordEncoder encoder, JwtService jwt) {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req, HttpServletResponse res) {
        User u = users.findByEmail(req.email()).orElse(null);
        if (u == null || u.getPassword() == null) return ResponseEntity.status(401).build();
        if (!encoder.matches(req.password(), u.getPassword())) return ResponseEntity.status(401).build();

        String token = jwt.createToken(u.getEmail(), u.getRole().name()); // admin/user

        // HttpOnly cookie
        String cookie = "CP_AUTH=" + token
                + "; Path=/"
                + "; HttpOnly"
                + "; SameSite=Lax";
        res.addHeader("Set-Cookie", cookie);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse res) {
        res.addHeader("Set-Cookie", "CP_AUTH=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication auth) {
        return auth == null ? ResponseEntity.status(401).build() : ResponseEntity.ok().build();
    }

    public record LoginRequest(String email, String password) {
    }
}