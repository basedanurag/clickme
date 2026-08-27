package com.clickme.dto.response;

import java.util.List;

public class AnalyticsResponse {

    private Long urlId;
    private String shortCode;
    private String originalUrl;

    private long totalClicks;
    private long todayClicks;

    private List<DailyClickResponse> last7Days;

    public AnalyticsResponse() {
    }

    public Long getUrlId() {
        return urlId;
    }

    public void setUrlId(Long urlId) {
        this.urlId = urlId;
    }

    public String getShortCode() {
        return shortCode;
    }

    public void setShortCode(String shortCode) {
        this.shortCode = shortCode;
    }

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public long getTotalClicks() {
        return totalClicks;
    }

    public void setTotalClicks(long totalClicks) {
        this.totalClicks = totalClicks;
    }

    public long getTodayClicks() {
        return todayClicks;
    }

    public void setTodayClicks(long todayClicks) {
        this.todayClicks = todayClicks;
    }

    public List<DailyClickResponse> getLast7Days() {
        return last7Days;
    }

    public void setLast7Days(List<DailyClickResponse> last7Days) {
        this.last7Days = last7Days;
    }
}