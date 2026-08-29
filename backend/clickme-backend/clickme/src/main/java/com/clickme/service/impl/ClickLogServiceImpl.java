package com.clickme.service.impl;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.clickme.entity.ClickLog;
import com.clickme.entity.Url;
import com.clickme.repository.ClickLogRepository;
import com.clickme.service.ClickLogService;
import com.clickme.dto.UserAgentDetails;
import com.clickme.service.UserAgentService;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class ClickLogServiceImpl implements ClickLogService {

    private static final Logger logger =
            LoggerFactory.getLogger(ClickLogServiceImpl.class);

    private final ClickLogRepository clickLogRepository;
    private final UserAgentService userAgentService;

    public ClickLogServiceImpl(ClickLogRepository clickLogRepository, UserAgentService userAgentService) {
        this.clickLogRepository = clickLogRepository;
        this.userAgentService = userAgentService;
    }

    @Override
    public void logClick(Url url, HttpServletRequest request) {

        UserAgentDetails uaDetails = userAgentService.parse(request);

        ClickLog clickLog = new ClickLog();

        clickLog.setUrl(url);
        clickLog.setClickedAt(LocalDateTime.now());
        clickLog.setIpAddress(resolveClientIp(request));

        clickLog.setBrowser(uaDetails.getBrowser());
        clickLog.setBrowserVersion(uaDetails.getBrowserVersion());
        clickLog.setOperatingSystem(uaDetails.getOperatingSystem());
        clickLog.setDevice(uaDetails.getDevice());

        // Referer can legitimately be null; store as-is.
        clickLog.setReferer(request.getHeader("Referer"));

        clickLogRepository.save(clickLog);

        logger.info(
                "Click logged | shortCode={} | browser={} {} | os={} | device={} | ip={}",
                url.getShortCode(),
                clickLog.getBrowser(),
                clickLog.getBrowserVersion(),
                clickLog.getOperatingSystem(),
                clickLog.getDevice(),
                clickLog.getIpAddress()
        );
    }

    /**
     * Resolves the real client IP address. When the app runs behind a reverse
     * proxy (e.g., Render, Nginx), the original IP is in X-Forwarded-For.
     * Falls back to getRemoteAddr() if the header is absent.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            // Header can be a comma-separated chain; first value is the client IP.
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}