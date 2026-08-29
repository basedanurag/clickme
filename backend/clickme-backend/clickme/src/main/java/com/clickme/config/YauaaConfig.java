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
        UserAgentAnalyzer analyzer = UserAgentAnalyzer
            .newBuilder()
            .hideMatcherLoadStats()
            .withCache(1000)
            .withField("AgentName")
            .withField("AgentVersion")
            .withField("OperatingSystemNameVersion")
            .withField("DeviceClass")
            .build();
            
        // Pre-heat the analyzer so the very first web request doesn't hang 
        analyzer.parse("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
        
        return analyzer;
    }
}
