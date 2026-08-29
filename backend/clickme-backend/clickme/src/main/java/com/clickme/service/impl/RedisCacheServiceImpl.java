package com.clickme.service.impl;

import java.time.Duration;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.clickme.dto.cache.UrlCacheDto;
import com.clickme.service.RedisCacheService;

@Service
public class RedisCacheServiceImpl implements RedisCacheService {

    private static final String PREFIX = "url:";

    private static final Duration CACHE_TTL = Duration.ofHours(24);

    private final RedisTemplate<String, UrlCacheDto> redisTemplate;

    public RedisCacheServiceImpl(
            RedisTemplate<String, UrlCacheDto> redisTemplate) {

        this.redisTemplate = redisTemplate;
    }

    @Override
    public void saveUrl(UrlCacheDto url) {
        try {
            redisTemplate.opsForValue().set(
                    PREFIX + url.getShortCode(),
                    url,
                    CACHE_TTL
            );
        } catch (Exception e) {
            System.err.println("Redis cache save error: " + e.getMessage());
        }
    }

    @Override
    public UrlCacheDto getUrl(String shortCode) {
        try {
            return redisTemplate.opsForValue().get(
                    PREFIX + shortCode
            );
        } catch (Exception e) {
            System.err.println("Redis cache get error: " + e.getMessage());
            return null;
        }
    }

    @Override
    public void deleteUrl(String shortCode) {
        try {
            redisTemplate.delete(PREFIX + shortCode);
        } catch (Exception e) {
            System.err.println("Redis cache delete error: " + e.getMessage());
        }
    }
}