package com.clickme.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UrlResponse {

    private Long id;

    private String originalUrl;

    private String shortCode;

    private String shortUrl;

    private Long clickCount;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime expiresAt;

    private String category;
}