package com.clickme.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "click_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClickLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "url_id", nullable = false)
    private Url url;

    // Nullable: request.getRemoteAddr() can be null behind a reverse proxy.
    // Real IP is resolved from X-Forwarded-For in ClickLogServiceImpl.
    private String ipAddress;

    // Nullable: requests may come in with no User-Agent header.
    private String browser;

    private String browserVersion;

    private String operatingSystem;

    private String device;

    private String referer;

    @Column(nullable = false)
    private LocalDateTime clickedAt;
}