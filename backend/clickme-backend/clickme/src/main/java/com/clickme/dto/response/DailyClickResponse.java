package com.clickme.dto.response;

import java.time.LocalDate;

public class DailyClickResponse {

    private LocalDate date;
    private long clicks;

    public DailyClickResponse() {
    }

    public DailyClickResponse(LocalDate date, long clicks) {
        this.date = date;
        this.clicks = clicks;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public long getClicks() {
        return clicks;
    }

    public void setClicks(long clicks) {
        this.clicks = clicks;
    }
}