package com.clickme.security;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.clickme.entity.User;
import com.clickme.enums.AuthProvider;
import com.clickme.enums.Role;
import com.clickme.repository.UserRepository;
import com.clickme.security.jwt.JwtService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Value("${allowed.origins:http://localhost:5173}")
    private String allowedOriginsRaw;
    
    @Value("${admin.email:}")
    private String adminEmail;

    public OAuth2AuthenticationSuccessHandler(JwtService jwtService, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (userOptional.isEmpty()) {
            Role assignedRole = email.equalsIgnoreCase(adminEmail) ? Role.ROLE_ADMIN : Role.ROLE_USER;

            User user = User.builder()
                    .name(name)
                    .email(email)
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .role(assignedRole)
                    .provider(AuthProvider.GOOGLE)
                    .active(true)
                    .build();
            userRepository.save(user);
        } else {
            User existingUser = userOptional.get();
            boolean changed = false;
            
            if (existingUser.getProvider() != AuthProvider.GOOGLE) {
                existingUser.setProvider(AuthProvider.GOOGLE);
                changed = true;
            }
            if (email.equalsIgnoreCase(adminEmail) && existingUser.getRole() != Role.ROLE_ADMIN) {
                existingUser.setRole(Role.ROLE_ADMIN);
                changed = true;
            }
            if (changed) {
                userRepository.save(existingUser);
            }
        }

        String token = jwtService.generateExchangeToken(email);
        
        // Get the first allowed origin as the frontend URL
        String frontendUrl = allowedOriginsRaw.split(",")[0].trim();
        String targetUrl = frontendUrl + "/oauth2/callback?code=" + token;
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
