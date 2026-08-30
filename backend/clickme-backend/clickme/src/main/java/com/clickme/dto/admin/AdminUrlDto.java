package com.clickme.dto.admin;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUrlDto {
    private Long id;
    private String originalUrl;
    private String shortCode;
    private Long clickCount;
    private Boolean active;
    private String category;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Long ownerId;
    private String ownerEmail;
}
