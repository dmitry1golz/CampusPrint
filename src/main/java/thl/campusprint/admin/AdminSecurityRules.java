package thl.campusprint.admin;


import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AuthorizeHttpRequestsConfigurer;
import org.springframework.stereotype.Component;
import thl.campusprint.common.SecurityRules;
import thl.campusprint.models.UserRole;

@Component
public class AdminSecurityRules implements SecurityRules {
    @Override
    public void configure(AuthorizeHttpRequestsConfigurer<HttpSecurity>.AuthorizationManagerRequestMatcherRegistry registry) {

        registry.requestMatchers("/admin/**").hasRole(UserRole.admin.name());

    }
}