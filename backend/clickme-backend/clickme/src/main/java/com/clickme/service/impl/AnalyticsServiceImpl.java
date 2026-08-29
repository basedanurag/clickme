package com.clickme.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.clickme.dto.response.AnalyticsBreakdownResponse;
import com.clickme.dto.response.AnalyticsResponse;
import com.clickme.dto.response.DailyClickResponse;
import com.clickme.entity.ClickLog;
import com.clickme.entity.Url;
import com.clickme.entity.User;
import com.clickme.exception.ResourceNotFoundException;
import com.clickme.repository.ClickLogRepository;
import com.clickme.repository.UrlRepository;
import com.clickme.security.CustomUserDetails;
import com.clickme.service.AnalyticsService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UrlRepository urlRepository;
    private final ClickLogRepository clickLogRepository;

    public AnalyticsServiceImpl(UrlRepository urlRepository,
                                ClickLogRepository clickLogRepository) {

        this.urlRepository = urlRepository;
        this.clickLogRepository = clickLogRepository;
    }

    @Override
    public AnalyticsResponse getAnalytics(Long urlId) {

        Url url = urlRepository.findByIdAndUser(urlId, getCurrentUser())
                .orElseThrow(() ->
                        new ResourceNotFoundException("URL not found"));

        AnalyticsResponse response = new AnalyticsResponse();

        response.setUrlId(url.getId());
        response.setShortCode(url.getShortCode());
        response.setOriginalUrl(url.getOriginalUrl());

        long totalClicks = clickLogRepository.countByUrlId(urlId);
        response.setTotalClicks(totalClicks);

        long todayClicks =
                clickLogRepository.countByUrlIdAndClickedAtAfter(
                        urlId,
                        LocalDate.now().atStartOfDay());

        response.setTodayClicks(todayClicks);

        List<ClickLog> logs = clickLogRepository.findByUrlId(urlId);

        List<DailyClickResponse> dailyStats = new ArrayList<>();

        for (int i = 6; i >= 0; i--) {

            LocalDate date = LocalDate.now().minusDays(i);

            long count = logs.stream()
                    .filter(log ->
                            log.getClickedAt()
                                    .toLocalDate()
                                    .equals(date))
                    .count();

            dailyStats.add(new DailyClickResponse(date, count));
        }

        response.setLast7Days(dailyStats);

        return response;
    }

    @Override
    public AnalyticsBreakdownResponse getBreakdown(Long urlId) {

        Url url = urlRepository.findByIdAndUser(urlId, getCurrentUser())
                .orElseThrow(() ->
                        new ResourceNotFoundException("URL not found"));

        // Each of these fires a single GROUP BY query — no full-table load.
        Map<String, Long> browsers   = toMap(clickLogRepository.countByBrowserForUrl(url.getId()));
        Map<String, Long> oses       = toMap(clickLogRepository.countByOsForUrl(url.getId()));
        Map<String, Long> devices    = toMap(clickLogRepository.countByDeviceForUrl(url.getId()));
        Map<String, Long> referrers  = toMap(clickLogRepository.countByRefererForUrl(url.getId()));

        AnalyticsBreakdownResponse response = new AnalyticsBreakdownResponse();
        response.setBrowsers(browsers);
        response.setOperatingSystems(oses);
        response.setDevices(devices);
        response.setReferrers(referrers);

        return response;
    }

    /**
     * Converts a list of [String, Long] Object[] rows (returned by GROUP BY
     * aggregate queries) into a Map, replacing null keys with a readable label.
     */
    private Map<String, Long> toMap(java.util.List<Object[]> rows) {
        Map<String, Long> result = new HashMap<>();
        for (Object[] row : rows) {
            String key   = (row[0] == null || row[0].toString().isBlank()) ? "Unknown" : row[0].toString();
            Long   count = ((Number) row[1]).longValue();
            result.merge(key, count, (a, b) -> a + b);
        }
        return result;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }
}