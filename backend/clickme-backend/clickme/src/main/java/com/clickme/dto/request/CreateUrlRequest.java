package com.clickme.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUrlRequest {

    @NotBlank(message = "Original URL is required")
    @Size(max = 2048, message = "URL cannot exceed 2048 characters")
    private String originalUrl;

    // Optional custom alias
    @Size(max = 20, message = "Custom alias cannot exceed 20 characters")
    private String customAlias;

    // Optional expiration date
    private LocalDateTime expiresAt;
}