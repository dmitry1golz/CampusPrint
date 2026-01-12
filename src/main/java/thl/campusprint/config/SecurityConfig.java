package thl.campusprint.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth ->
                                auth
                                        // 1. STATIC RESOURCES
                                        .requestMatchers(
                                                "/styles/**",
                                                "/js/**",
                                                "/scripts/**",
                                                "/images/**",
                                                "/static/**",
                                                "/assets/**")
                                        .permitAll()

                                        // 2. PUBLIC HTML PAGES (Added "/admin.html" here)
                                        .requestMatchers(
                                                "/",
                                                "/index.html",
                                                "/booking.html",
                                                "/myPrints.html",
                                                "/deviceCatalog.html",
                                                "/adminLogin.html",
                                                "/admin.html",
                                                "/header.html",
                                                "/footer.html" // <--- FIX: Allow browser to load
                                                // the dashboard shell
                                                )
                                        .permitAll()

                                        // 3. AUTH API
                                        .requestMatchers("/api/auth/**")
                                        .permitAll()

                                        // 4. PUBLIC API ENDPOINTS
                                        .requestMatchers(HttpMethod.GET, "/api/devices")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/devices/**")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.POST, "/api/bookings")
                                        .permitAll()
                                        .requestMatchers(HttpMethod.GET, "/api/bookings")
                                        .permitAll()

                                        // 5. H2 CONSOLE
                                        .requestMatchers("/h2-console/**")
                                        .permitAll()

                                        // 6. PROTECTED ADMIN ENDPOINTS
                                        .requestMatchers(HttpMethod.POST, "/api/devices")
                                        .hasRole("ADMIN")
                                        .requestMatchers(HttpMethod.DELETE, "/api/devices/**")
                                        .hasRole("ADMIN")
                                        .requestMatchers("/api/bookings/status")
                                        .hasRole("ADMIN")

                                        // ALL OTHER REQUESTS
                                        .anyRequest()
                                        .authenticated())
                .headers(headers -> headers.frameOptions(frame -> frame.disable()))
                .addFilterBefore(
                        jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
