package com.clickme.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.clickme.security.jwt.JwtAuthenticationEntryPoint;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    // Comma-separated list of allowed origins.
    // Set ALLOWED_ORIGINS env var on Render to include your Netlify URL.
    // e.g. ALLOWED_ORIGINS=https://your-app.netlify.app,http://localhost:5173
    @Value("${allowed.origins:http://localhost:5173,http://localhost:5174}")
    private String allowedOriginsRaw;

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            JwtAuthenticationEntryPoint authenticationEntryPoint) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.authenticationEntryPoint = authenticationEntryPoint;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .exceptionHandling(exception ->
                        exception.authenticationEntryPoint(authenticationEntryPoint))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/api/auth/**",
                                "/api/health",
                                "/swagger-ui/**",
                                "/v3/api-docs/**")
                        .permitAll()

                        .requestMatchers(HttpMethod.GET, "/{shortCode:[a-zA-Z0-9-_]+}")
                        .permitAll()

                        .anyRequest()
                        .authenticated())

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        // Parse the comma-separated origins list from the environment variable
        List<String> allowedOrigins = List.of(allowedOriginsRaw.split(","))
                .stream()
                .map(String::trim)
                .toList();

        CorsConfiguration configuration = new CorsConfiguration();
        // Use explicit origins (not wildcard) so browsers accept the response.
        // allowCredentials(true) + "*" is rejected by browsers; we don't need
        // credentials mode since we use Authorization headers (Bearer JWT).
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization"));
        // Do NOT set allowCredentials(true) — Bearer tokens are sent in the
        // Authorization header, not cookies, so credentials mode is not required.

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration)
            throws Exception {

        return configuration.getAuthenticationManager();
    }
}