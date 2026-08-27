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
import com.clickme.entity.ClickLog;
import com.clickme.entity.Url;
import com.clickme.entity.User;
import com.clickme.exception.BadRequestException;
import com.clickme.exception.ResourceNotFoundException;
import com.clickme.repository.ClickLogRepository;
import com.clickme.repository.UrlRepository;
import com.clickme.security.CustomUserDetails;
import com.clickme.service.RedisCacheService;
import com.clickme.service.UrlService;
import com.clickme.service.AiService;
import com.clickme.service.UserAgentService;
import com.clickme.dto.UserAgentDetails;
import com.clickme.util.ShortCodeGenerator;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class UrlServiceImpl implements UrlService {

    private final UrlRepository urlRepository;
    private final ClickLogRepository clickLogRepository;
    private final RedisCacheService redisCacheService;
    private final AiService aiService;
    private final UserAgentService userAgentService;

    @Value("${app.base-url}")
    private String baseUrl;

    public UrlServiceImpl(UrlRepository urlRepository,
                          ClickLogRepository clickLogRepository,
                          RedisCacheService redisCacheService,
                          AiService aiService,
                          UserAgentService userAgentService) {
        this.urlRepository = urlRepository;
        this.clickLogRepository = clickLogRepository;
        this.redisCacheService = redisCacheService;
        this.aiService = aiService;
        this.userAgentService = userAgentService;
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

        String category = aiService.categorizeUrl(request.getOriginalUrl());

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
    }

    @Override
    @Transactional
    public String redirectToOriginalUrl(String shortCode,
                                        HttpServletRequest request) {

        UrlCacheDto cachedUrl = redisCacheService.getUrl(shortCode);
        
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
        ClickLog clickLog = new ClickLog();

        clickLog.setUrl(urlRepository.getReferenceById(urlId));
        clickLog.setClickedAt(LocalDateTime.now());
        clickLog.setIpAddress(request.getRemoteAddr());

        UserAgentDetails uaDetails = userAgentService.parse(request);

        // DEBUG OUTPUT
        System.out.println("\n========== USER AGENT DEBUG ==========");
        System.out.println("BROWSER        : " + uaDetails.getBrowser());
        System.out.println("VERSION        : " + uaDetails.getBrowserVersion());
        System.out.println("OS             : " + uaDetails.getOperatingSystem());
        System.out.println("DEVICE         : " + uaDetails.getDevice());
        System.out.println("======================================\n");

        clickLog.setBrowser(uaDetails.getBrowser());
        clickLog.setBrowserVersion(uaDetails.getBrowserVersion());
        clickLog.setOperatingSystem(uaDetails.getOperatingSystem());
        clickLog.setDevice(uaDetails.getDevice());

        clickLog.setReferer(request.getHeader("Referer"));

        clickLogRepository.save(clickLog);

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

            if (uri.getScheme() == null || uri.getHost() == null) {
                throw new BadRequestException("Invalid URL.");
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