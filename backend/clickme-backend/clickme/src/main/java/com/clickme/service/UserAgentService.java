package com.clickme.service;

import com.clickme.dto.UserAgentDetails;

import jakarta.servlet.http.HttpServletRequest;

public interface UserAgentService {
    UserAgentDetails parse(HttpServletRequest request);
}