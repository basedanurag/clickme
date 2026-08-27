package com.clickme.service;

import com.clickme.dto.cache.UrlCacheDto;

public interface RedisCacheService {

    void saveUrl(UrlCacheDto url);

    UrlCacheDto getUrl(String shortCode);

    void deleteUrl(String shortCode);

}