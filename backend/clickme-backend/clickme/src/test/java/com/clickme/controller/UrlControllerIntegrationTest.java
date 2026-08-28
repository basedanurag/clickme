package com.clickme.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.clickme.dto.request.CreateUrlRequest;

import com.clickme.entity.User;
import com.clickme.enums.AuthProvider;
import com.clickme.enums.Role;
import com.clickme.repository.UrlRepository;
import com.clickme.repository.UserRepository;
import com.clickme.service.AiService;
import com.clickme.service.RedisCacheService;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UrlControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UrlRepository urlRepository;

    @MockitoBean
    private RedisCacheService redisCacheService;

    @MockitoBean
    private AiService aiService;

    private User testUser;

    @BeforeEach
    void setUp() {
        urlRepository.deleteAll();
        userRepository.deleteAll();

        testUser = User.builder()
                .name("Test User")
                .email("test@example.com")
                .password("password")
                .role(Role.ROLE_USER)
                .provider(AuthProvider.LOCAL)
                .active(true)
                .build();
        testUser = userRepository.save(testUser);

        when(aiService.categorizeUrl(any())).thenReturn("Technology");
    }

    @Test
    void testGetUrlsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/url/my-urls"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithUserDetails(value = "test@example.com", setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void testCreateShortUrlSuccess() throws Exception {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://spring.io");

        mockMvc.perform(post("/api/url/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalUrl").value("https://spring.io"))
                .andExpect(jsonPath("$.shortCode").exists())
                .andExpect(jsonPath("$.category").value("Technology"));
    }

    @Test
    @WithUserDetails(value = "test@example.com", setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void testCreateShortUrlDuplicateAlias() throws Exception {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://spring.io");
        request.setCustomAlias("spring");

        // Create first time successfully
        mockMvc.perform(post("/api/url/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Try second time with exact same alias
        mockMvc.perform(post("/api/url/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Custom alias already exists."));
    }

    @Test
    @WithUserDetails(value = "test@example.com", setupBefore = org.springframework.security.test.context.support.TestExecutionEvent.TEST_EXECUTION)
    void testDeleteUrlSuccess() throws Exception {
        CreateUrlRequest request = new CreateUrlRequest();
        request.setOriginalUrl("https://spring.io");

        String responseString = mockMvc.perform(post("/api/url/shorten")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long id = objectMapper.readTree(responseString).get("id").asLong();

        mockMvc.perform(delete("/api/url/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").value("URL deleted successfully."));
    }
}
