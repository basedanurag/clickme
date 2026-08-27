package com.clickme.service.impl;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.clickme.dto.UserAgentDetails;
import com.clickme.service.UserAgentService;

import jakarta.servlet.http.HttpServletRequest;
import nl.basjes.parse.useragent.UserAgent;
import nl.basjes.parse.useragent.UserAgentAnalyzer;

@Service
public class UserAgentServiceImpl implements UserAgentService {

    private final UserAgentAnalyzer userAgentAnalyzer;

    public UserAgentServiceImpl(UserAgentAnalyzer userAgentAnalyzer) {
        this.userAgentAnalyzer = userAgentAnalyzer;
    }

    @Override
    public UserAgentDetails parse(HttpServletRequest request) {
        
        Map<String, String> headers = new HashMap<>();
        Collections.list(request.getHeaderNames()).forEach(headerName -> 
            headers.put(headerName, request.getHeader(headerName))
        );

        UserAgent agent = userAgentAnalyzer.parse(headers);

        String browser = agent.getValue(UserAgent.AGENT_NAME);
        String browserVersion = agent.getValue(UserAgent.AGENT_VERSION);
        String os = agent.getValue(UserAgent.OPERATING_SYSTEM_NAME_VERSION);
        String device = agent.getValue(UserAgent.DEVICE_CLASS);

        return UserAgentDetails.builder()
                .browser(browser != null && !browser.equals("Unknown") ? browser : "Unknown")
                .browserVersion(browserVersion != null ? browserVersion : "")
                .operatingSystem(os != null && !os.equals("Unknown") ? os : "Unknown")
                .device(device != null ? device : "Unknown")
                .build();
    }
}