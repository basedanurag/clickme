package com.clickme.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "click_logs")
public class ClickLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id", nullable = false)
    private Url url;

    @Column(nullable = false)
    private String ipAddress;

    @Column(nullable = false)
    private String browser;

    private String browserVersion;

    private String operatingSystem;

    @Column(nullable = false)
    private String device;

    private String referer;

    @Column(nullable = false)
    private LocalDateTime clickedAt;

    public ClickLog() {
    }

    public ClickLog(Long id,
                    Url url,
                    String ipAddress,
                    String browser,
                    String browserVersion,
                    String operatingSystem,
                    String device,
                    String referer,
                    LocalDateTime clickedAt) {

        this.id = id;
        this.url = url;
        this.ipAddress = ipAddress;
        this.browser = browser;
        this.browserVersion = browserVersion;
        this.operatingSystem = operatingSystem;
        this.device = device;
        this.referer = referer;
        this.clickedAt = clickedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Url getUrl() {
        return url;
    }

    public void setUrl(Url url) {
        this.url = url;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getBrowser() {
        return browser;
    }

    public void setBrowser(String browser) {
        this.browser = browser;
    }

    public String getBrowserVersion() {
        return browserVersion;
    }

    public void setBrowserVersion(String browserVersion) {
        this.browserVersion = browserVersion;
    }

    public String getOperatingSystem() {
        return operatingSystem;
    }

    public void setOperatingSystem(String operatingSystem) {
        this.operatingSystem = operatingSystem;
    }

    public String getDevice() {
        return device;
    }

    public void setDevice(String device) {
        this.device = device;
    }

    public String getReferer() {
        return referer;
    }

    public void setReferer(String referer) {
        this.referer = referer;
    }

    public LocalDateTime getClickedAt() {
        return clickedAt;
    }

    public void setClickedAt(LocalDateTime clickedAt) {
        this.clickedAt = clickedAt;
    }
}