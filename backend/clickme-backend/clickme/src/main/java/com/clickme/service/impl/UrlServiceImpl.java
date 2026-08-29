package com.clickme.service.impl;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clickme.dto.cache.UrlCacheDto;
import com.clickme.dto.request.CreateUrlRequest;
import com.clickme.dto.response.UrlResponse;
import com.clickme.entity.Url;
import com.clickme.entity.User;
import com.clickme.exception.BadRequestException;
import com.clickme.exception.ResourceNotFoundException;
import com.clickme.repository.UrlRepository;
import com.clickme.security.CustomUserDetails;
import com.clickme.service.ClickLogService;
import com.clickme.service.RedisCacheService;
import com.clickme.service.UrlService;
import com.clickme.util.ShortCodeGenerator;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UrlServiceImpl implements UrlService {

    private final UrlRepository urlRepository;
    private final ClickLogService clickLogService;
    private final RedisCacheService redisCacheService;

    @Value("${app.base-url}")
    private String baseUrl;

    public UrlServiceImpl(UrlRepository urlRepository,
                          ClickLogService clickLogService,
                          RedisCacheService redisCacheService) {
        this.urlRepository = urlRepository;
        this.clickLogService = clickLogService;
        this.redisCacheService = redisCacheService;
    }

    @Override
    public UrlResponse createShortUrl(CreateUrlRequest request) {

        validateUrl(request.getOriginalUrl());

        User currentUser = getCurrentUser();

        String shortCode;

        if (request.getCustomAlias() != null
                && !request.getCustomAlias().isBlank()) {

            if (urlRepository.existsByShortCode(request.getCustomAlias())) {
                throw new BadRequestException("Custom alias already exists.");
            }

            shortCode = request.getCustomAlias();

        } else {

            do {
                shortCode = ShortCodeGenerator.generate();
            } while (urlRepository.existsByShortCode(shortCode));
        }

        String category = "Uncategorized";

        Url url = Url.builder()
                .originalUrl(request.getOriginalUrl())
                .shortCode(shortCode)
                .expiresAt(request.getExpiresAt())
                .user(currentUser)
                .category(category)
                .build();

        Url savedUrl = urlRepository.save(url);

        redisCacheService.saveUrl(new UrlCacheDto(
                savedUrl.getId(),
                savedUrl.getShortCode(),
                savedUrl.getOriginalUrl(),
                savedUrl.getActive(),
                savedUrl.getExpiresAt()
        ));

        return mapToResponse(savedUrl);
    }

    @Override
    public UrlResponse getOriginalUrl(String shortCode) {

        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Short URL not found."));

        return mapToResponse(url);
    }

    @Override
    public List<UrlResponse> getMyUrls() {

        User currentUser = getCurrentUser();

        return urlRepository.findByUser(currentUser)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteUrl(Long id) {

        User currentUser = getCurrentUser();

        Url url = urlRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() ->
                        new ResourceNotFoundException("URL not found."));

        urlRepository.delete(url);
        
        // Evict from Redis cache so the short link stops redirecting immediately
        redisCacheService.deleteUrl(url.getShortCode());
    }

    @Override
    @Transactional
    public String redirectToOriginalUrl(String shortCode,
                                        HttpServletRequest request) {

        UrlCacheDto cachedUrl = null;
        try {
            cachedUrl = redisCacheService.getUrl(shortCode);
        } catch (Exception e) {
            // Log the error but continue to fallback to database
            System.err.println("Redis cache error: " + e.getMessage());
        }
        
        Long urlId;
        String originalUrl;
        
        if (cachedUrl != null) {
            if (!Boolean.TRUE.equals(cachedUrl.getActive())) {
                throw new BadRequestException("This link has been disabled.");
            }
            if (cachedUrl.getExpiresAt() != null && cachedUrl.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("This link has expired.");
            }
            urlId = cachedUrl.getId();
            originalUrl = cachedUrl.getOriginalUrl();
        } else {
            Url url = urlRepository.findByShortCode(shortCode)
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Short URL not found."));

            if (!Boolean.TRUE.equals(url.getActive())) {
                throw new BadRequestException("This link has been disabled.");
            }

            if (url.getExpiresAt() != null &&
                    url.getExpiresAt().isBefore(LocalDateTime.now())) {
                throw new BadRequestException("This link has expired.");
            }
            
            urlId = url.getId();
            originalUrl = url.getOriginalUrl();
            
            redisCacheService.saveUrl(new UrlCacheDto(
                    url.getId(),
                    url.getShortCode(),
                    url.getOriginalUrl(),
                    url.getActive(),
                    url.getExpiresAt()
            ));
        }

        // Increment click counter
        urlRepository.incrementClickCount(urlId);

        // Create click log
        clickLogService.logClick(urlRepository.getReferenceById(urlId), request);

        return originalUrl;
    }

    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        return userDetails.getUser();
    }

    private void validateUrl(String originalUrl) {

        try {

            URI uri = URI.create(originalUrl);

            if (uri.getScheme() == null || uri.getHost() == null || 
                (!uri.getScheme().equalsIgnoreCase("http") && !uri.getScheme().equalsIgnoreCase("https"))) {
                throw new BadRequestException("Invalid URL. Only HTTP and HTTPS are allowed.");
            }

        } catch (Exception ex) {
            throw new BadRequestException("Invalid URL.");
        }
    }

    private UrlResponse mapToResponse(Url url) {

        return UrlResponse.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .shortUrl(baseUrl + "/" + url.getShortCode())
                .clickCount(url.getClickCount())
                .active(url.getActive())
                .createdAt(url.getCreatedAt())
                .expiresAt(url.getExpiresAt())
                .category(url.getCategory())
                .build();
    }
}