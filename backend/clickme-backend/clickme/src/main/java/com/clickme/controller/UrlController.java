package com.clickme.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.clickme.dto.request.CreateUrlRequest;
import com.clickme.dto.response.UrlResponse;
import com.clickme.service.UrlService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/url")
@Validated
public class UrlController {

    private final UrlService urlService;

    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }

    @PostMapping("/shorten")
    public ResponseEntity<UrlResponse> createShortUrl(
            @Valid @RequestBody CreateUrlRequest request) {

        return ResponseEntity.ok(urlService.createShortUrl(request));
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<UrlResponse> getOriginalUrl(
            @PathVariable String shortCode) {

        return ResponseEntity.ok(urlService.getOriginalUrl(shortCode));
    }

    @GetMapping("/my-urls")
    public ResponseEntity<List<UrlResponse>> getMyUrls() {

        return ResponseEntity.ok(urlService.getMyUrls());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUrl(@PathVariable Long id) {

        urlService.deleteUrl(id);

        return ResponseEntity.ok("URL deleted successfully.");
    }
}