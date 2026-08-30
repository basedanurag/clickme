package com.clickme.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.clickme.dto.request.LoginRequest;
import com.clickme.dto.request.SignupRequest;
import com.clickme.dto.response.AuthResponse;
import org.springframework.beans.factory.annotation.Value;
import com.clickme.dto.response.UserResponse;
import com.clickme.entity.User;
import com.clickme.enums.AuthProvider;
import com.clickme.enums.Role;
import com.clickme.exception.BadRequestException;
import com.clickme.repository.UserRepository;
import com.clickme.security.CustomUserDetails;
import com.clickme.security.jwt.JwtService;
import com.clickme.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${admin.email:}")
    private String adminEmail;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           AuthenticationManager authenticationManager) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Override
    public AuthResponse signup(SignupRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists.");
        }

        Role assignedRole = request.getEmail().equalsIgnoreCase(adminEmail) ? Role.ROLE_ADMIN : Role.ROLE_USER;

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .provider(AuthProvider.LOCAL)
                .active(true)
                .build();

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .message("User registered successfully.")
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new BadRequestException("Invalid credentials."));

        String token = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .message("Login successful.")
                .build();
    }

    @Override
    public AuthResponse oauth2Login(String token) {
        String email = jwtService.extractEmail(token);
        
        if (!jwtService.isExchangeTokenValid(token, email)) {
            throw new BadRequestException("Invalid or expired OAuth2 exchange token.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found."));

        String jwt = jwtService.generateToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .message("OAuth2 Login successful.")
                .build();
    }

    @Override
    public UserResponse getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof CustomUserDetails userDetails)) {
            throw new BadRequestException("Not authenticated.");
        }
        User user = userDetails.getUser();
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}