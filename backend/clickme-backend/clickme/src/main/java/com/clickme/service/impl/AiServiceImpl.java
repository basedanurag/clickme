package com.clickme.service.impl;

import org.springframework.stereotype.Service;
import com.clickme.service.AiService;
import java.util.Random;

@Service
public class AiServiceImpl implements AiService {

    private final String[] mockCategories = {
        "Technology", "Social Media", "News & Media", 
        "Entertainment", "Education", "E-commerce",
        "Productivity", "Uncategorized"
    };

    @Override
    public String categorizeUrl(String originalUrl) {
        // Mock implementation of AI categorization
        // In a real scenario, this would call an external LLM API
        try {
            // Simulate API delay
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        if (originalUrl.contains("youtube") || originalUrl.contains("netflix")) {
            return "Entertainment";
        }
        if (originalUrl.contains("amazon") || originalUrl.contains("ebay")) {
            return "E-commerce";
        }
        if (originalUrl.contains("github") || originalUrl.contains("stackoverflow")) {
            return "Technology";
        }
        
        // Random fallback
        return mockCategories[new Random().nextInt(mockCategories.length)];
    }
}
