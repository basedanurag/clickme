package com.clickme.service;

import com.clickme.dto.response.AnalyticsBreakdownResponse;
import com.clickme.dto.response.AnalyticsResponse;

public interface AnalyticsService {

    AnalyticsResponse getAnalytics(Long urlId);

    AnalyticsBreakdownResponse getBreakdown(Long urlId);
}