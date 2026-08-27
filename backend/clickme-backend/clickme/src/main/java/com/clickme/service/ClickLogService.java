package com.clickme.service;

import com.clickme.entity.Url;

import jakarta.servlet.http.HttpServletRequest;

public interface ClickLogService {

    void logClick(Url url, HttpServletRequest request);

}