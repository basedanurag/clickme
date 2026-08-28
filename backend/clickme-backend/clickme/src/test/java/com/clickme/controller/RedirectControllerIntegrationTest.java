package com.clickme.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.clickme.dto.UserAgentDetails;
import com.clickme.entity.Url;
import com.clickme.entity.User;
import com.clickme.enums.AuthProvider;
import com.clickme.enums.Role;
import com.clickme.repository.ClickLogRepository;
import com.clickme.repository.UrlRepository;
import com.clickme.repository.UserRepository;
import com.clickme.service.RedisCacheService;
import com.clickme.service.UserAgentService;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class RedirectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UrlRepository urlRepository;

    @Autowired
    private ClickLogRepository clickLogRepository;

    @MockitoBean
    private RedisCacheService redisCacheService; // Force fallback to DB

    @MockitoBean
    private UserAgentService userAgentService;

    private Url testUrl;

    @BeforeEach
    void setUp() {
        clickLogRepository.deleteAll();
        urlRepository.deleteAll();
        userRepository.deleteAll();

        User testUser = User.builder()
                .name("Test User")
                .email("test@example.com")
                .password("password")
                .role(Role.ROLE_USER)
                .provider(AuthProvider.LOCAL)
                .active(true)
                .build();
        testUser = userRepository.save(testUser);

        testUrl = Url.builder()
                .originalUrl("https://github.com")
                .shortCode("ghub")
                .user(testUser)
                .active(true)
                .category("Development")
                .build();
        testUrl = urlRepository.save(testUrl);

        UserAgentDetails mockDetails = new UserAgentDetails();
        mockDetails.setBrowser("Chrome");
        mockDetails.setBrowserVersion("114.0");
        mockDetails.setOperatingSystem("Windows 10");
        mockDetails.setDevice("Desktop");
        
        when(userAgentService.parse(any())).thenReturn(mockDetails);
    }

    @Test
    void testRedirectSuccessAndAnalyticsTracking() throws Exception {
        // Assert initial state
        assertEquals(0L, clickLogRepository.count());

        // Perform redirect
        mockMvc.perform(get("/ghub"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", "https://github.com"));

        // Assert click count increased
        Url updatedUrl = urlRepository.findById(testUrl.getId()).orElseThrow();
        assertEquals(1L, updatedUrl.getClickCount());

        // Assert click log created
        assertEquals(1L, clickLogRepository.count());
        assertEquals("Chrome", clickLogRepository.findAll().get(0).getBrowser());
    }

    @Test
    void testRedirectNotFound() throws Exception {
        mockMvc.perform(get("/nonexistent"))
                .andExpect(status().isNotFound());
    }
}
