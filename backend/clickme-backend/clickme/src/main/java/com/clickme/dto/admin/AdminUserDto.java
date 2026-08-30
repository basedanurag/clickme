package com.clickme.dto.admin;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminUserDto {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String provider;
    private Boolean active;
    private LocalDateTime createdAt;
    private long totalUrls;
    private long totalClicks;
}
