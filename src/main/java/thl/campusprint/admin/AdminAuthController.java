package thl.campusprint.admin;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminAuthController {

    private static final String COOKIE_NAME = "ADMIN_SESSION";
    private final AdminAuthService auth;

    public AdminAuthController(AdminAuthService auth) {
        this.auth = auth;
    }

    private static String readCookie(HttpServletRequest req, String name) {
        if (req.getCookies() == null) return null;
        for (Cookie c : req.getCookies()) {
            if (name.equals(c.getName())) return c.getValue();
        }
        return null;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest req, HttpServletResponse res) {
        if (req.email() == null || req.password() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.fail("bad_request"));
        }

        var tokenOpt = auth.login(req.email(), req.password());
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(401).body(ApiResponse.fail("invalid_credentials"));
        }

        Cookie c = new Cookie(COOKIE_NAME, tokenOpt.get());
        c.setHttpOnly(true);
        c.setPath("/");
        res.addCookie(c);

        return ResponseEntity.ok(ApiResponse.ok());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse> me(HttpServletRequest req) {
        String token = readCookie(req, COOKIE_NAME);
        if (!auth.isValid(token)) {
            return ResponseEntity.status(401).body(ApiResponse.fail("unauthorized"));
        }
        return ResponseEntity.ok(ApiResponse.ok());
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse> logout(HttpServletRequest req, HttpServletResponse res) {
        String token = readCookie(req, COOKIE_NAME);
        auth.logout(token);

        Cookie c = new Cookie(COOKIE_NAME, "");
        c.setPath("/");
        c.setMaxAge(0);
        res.addCookie(c);

        return ResponseEntity.ok(ApiResponse.ok());
    }

    public record LoginRequest(String email, String password) {
    }

}