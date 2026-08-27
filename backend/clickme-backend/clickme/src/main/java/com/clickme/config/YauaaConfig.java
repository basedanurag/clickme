package com.clickme.config;

import nl.basjes.parse.useragent.UserAgentAnalyzer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class YauaaConfig {

    @Bean
    public UserAgentAnalyzer userAgentAnalyzer() {
        // Initializes the YAUAA engine which takes a few seconds.
        // It's recommended to do this as a singleton Bean.
        return UserAgentAnalyzer
            .newBuilder()
            .hideMatcherLoadStats()
            .withCache(10000)
            .build();
    }
}
