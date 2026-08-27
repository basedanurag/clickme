package com.clickme.dto.response;

import java.util.Map;

public class AnalyticsBreakdownResponse {

    private Map<String, Long> browsers;
    private Map<String, Long> operatingSystems;
    private Map<String, Long> devices;
    private Map<String, Long> referrers;

    public Map<String, Long> getBrowsers() {
        return browsers;
    }

    public void setBrowsers(Map<String, Long> browsers) {
        this.browsers = browsers;
    }

    public Map<String, Long> getOperatingSystems() {
        return operatingSystems;
    }

    public void setOperatingSystems(Map<String, Long> operatingSystems) {
        this.operatingSystems = operatingSystems;
    }

    public Map<String, Long> getDevices() {
        return devices;
    }

    public void setDevices(Map<String, Long> devices) {
        this.devices = devices;
    }

    public Map<String, Long> getReferrers() {
        return referrers;
    }

    public void setReferrers(Map<String, Long> referrers) {
        this.referrers = referrers;
    }
}