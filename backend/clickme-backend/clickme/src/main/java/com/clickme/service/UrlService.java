package com.clickme.service;

import java.util.List;

import com.clickme.dto.request.CreateUrlRequest;
import com.clickme.dto.response.UrlResponse;
import jakarta.servlet.http.HttpServletRequest;


public interface UrlService {

    UrlResponse createShortUrl(CreateUrlRequest request);

    UrlResponse getOriginalUrl(String shortCode);

    List<UrlResponse> getMyUrls();

    void deleteUrl(Long id);

    String redirectToOriginalUrl(String shortCode,
            HttpServletRequest request);;

}