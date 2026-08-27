package com.clickme.controller;

import org.springframework.http.ResponseEntity;
import com.clickme.dto.response.AnalyticsBreakdownResponse;
import org.springframework.web.bind.annotation.*;

import com.clickme.dto.response.AnalyticsResponse;
import com.clickme.service.AnalyticsService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/{urlId}")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @PathVariable Long urlId) {

        return ResponseEntity.ok(
                analyticsService.getAnalytics(urlId));
    }
    @GetMapping("/{urlId}/breakdown")
    public ResponseEntity<AnalyticsBreakdownResponse> getBreakdown(
            @PathVariable Long urlId) {

        return ResponseEntity.ok(
                analyticsService.getBreakdown(urlId));
    }
}