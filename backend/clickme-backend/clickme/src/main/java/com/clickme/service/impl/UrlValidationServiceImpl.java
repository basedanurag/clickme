package com.clickme.service.impl;

import java.net.URI;

import org.springframework.stereotype.Service;

import com.clickme.exception.BadRequestException;
import com.clickme.service.UrlValidationService;

@Service
public class UrlValidationServiceImpl implements UrlValidationService {

    @Override
    public void validateUrl(String originalUrl) {

        if (originalUrl == null || originalUrl.isBlank()) {
            throw new BadRequestException("URL cannot be empty.");
        }

        try {

            URI uri = URI.create(originalUrl);

            if (uri.getScheme() == null || uri.getHost() == null) {
                throw new BadRequestException("Invalid URL.");
            }

            if (!uri.getScheme().equalsIgnoreCase("http")
                    && !uri.getScheme().equalsIgnoreCase("https")) {

                throw new BadRequestException(
                        "Only HTTP and HTTPS URLs are supported."
                );
            }

        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid URL.");
        }
    }
}