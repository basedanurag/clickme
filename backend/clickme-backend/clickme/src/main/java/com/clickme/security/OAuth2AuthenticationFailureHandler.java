package com.clickme.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Value("${allowed.origins:http://localhost:5173}")
    private String allowedOriginsRaw;

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {
        
        String frontendUrl = allowedOriginsRaw.split(",")[0].trim();
        String targetUrl = frontendUrl + "/login?error=oauth2_failed";
        
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
