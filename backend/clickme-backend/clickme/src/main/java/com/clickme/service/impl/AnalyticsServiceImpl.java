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
import com.clickme.exception.ResourceNotFoundException;
import com.clickme.repository.ClickLogRepository;
import com.clickme.repository.UrlRepository;
import com.clickme.service.AnalyticsService;

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

        Url url = urlRepository.findById(urlId)
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

        Url url = urlRepository.findById(urlId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("URL not found"));

        List<ClickLog> logs = clickLogRepository.findByUrlId(url.getId());

        Map<String, Long> browsers = new HashMap<>();
        Map<String, Long> operatingSystems = new HashMap<>();
        Map<String, Long> devices = new HashMap<>();
        Map<String, Long> referrers = new HashMap<>();

        for (ClickLog log : logs) {

            // Browser
            String browser = (log.getBrowser() == null || log.getBrowser().isBlank())
                    ? "Unknown"
                    : log.getBrowser();

            browsers.put(browser,
                    browsers.getOrDefault(browser, 0L) + 1);

            // Operating System
            String os = (log.getOperatingSystem() == null || log.getOperatingSystem().isBlank())
                    ? "Unknown"
                    : log.getOperatingSystem();

            operatingSystems.put(os,
                    operatingSystems.getOrDefault(os, 0L) + 1);

            // Device
            String device = (log.getDevice() == null || log.getDevice().isBlank())
                    ? "Unknown"
                    : log.getDevice();

            devices.put(device,
                    devices.getOrDefault(device, 0L) + 1);

            // Referrer
            String referer = (log.getReferer() == null || log.getReferer().isBlank())
                    ? "Direct"
                    : log.getReferer();

            referrers.put(referer,
                    referrers.getOrDefault(referer, 0L) + 1);
        }

        AnalyticsBreakdownResponse response = new AnalyticsBreakdownResponse();

        response.setBrowsers(browsers);
        response.setOperatingSystems(operatingSystems);
        response.setDevices(devices);
        response.setReferrers(referrers);

        return response;
    }
}