package com.clickme.dto.cache;

import java.io.Serializable;
import java.time.LocalDateTime;

public class UrlCacheDto implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;
    private String shortCode;
    private String originalUrl;
    private Boolean active;
    private LocalDateTime expiresAt;

    public UrlCacheDto() {
    }

    public UrlCacheDto(Long id,
                       String shortCode,
                       String originalUrl,
                       Boolean active,
                       LocalDateTime expiresAt) {

        this.id = id;
        this.shortCode = shortCode;
        this.originalUrl = originalUrl;
        this.active = active;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}