package com.clickme.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
public class RootController {

    /**
     * Root handler — shown when visiting the Render URL in a browser directly.
     */
    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "ClickMe API",
            "message", "Backend is running. Access the app via the Netlify frontend."
        ));
    }

    /**
     * Health check — use this to verify Render connectivity from Netlify
     * without needing authentication.
     * Example: GET https://clickme-backend-g7j7.onrender.com/api/health
     */
    @GetMapping("/api/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "timestamp", LocalDateTime.now().toString()
        ));
    }
}

