package com.clickme.controller;

import org.springframework.http.HttpHeaders;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.clickme.service.UrlService;

@RestController
public class RedirectController {

    private final UrlService urlService;

    public RedirectController(UrlService urlService) {
        this.urlService = urlService;
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<Void> redirect(@PathVariable String shortCode,
                                         HttpServletRequest request) {

        String originalUrl =
                urlService.redirectToOriginalUrl(shortCode, request);

        return ResponseEntity.status(302)
                .header(HttpHeaders.LOCATION, originalUrl)
                .build();
    }
    
}