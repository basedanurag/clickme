package com.clickme.service.impl;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clickme.dto.admin.AdminDashboardStats;
import com.clickme.dto.admin.AdminUrlDto;
import com.clickme.dto.admin.AdminUserDto;
import com.clickme.entity.AuditLog;
import com.clickme.entity.Url;
import com.clickme.entity.User;
import com.clickme.enums.Role;
import com.clickme.exception.BadRequestException;
import com.clickme.repository.AuditLogRepository;
import com.clickme.repository.ClickLogRepository;
import com.clickme.repository.UrlRepository;
import com.clickme.repository.UserRepository;
import com.clickme.service.AdminService;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final UrlRepository urlRepository;
    private final ClickLogRepository clickLogRepository;
    private final AuditLogRepository auditLogRepository;

    public AdminServiceImpl(UserRepository userRepository, UrlRepository urlRepository,
            ClickLogRepository clickLogRepository, AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.urlRepository = urlRepository;
        this.clickLogRepository = clickLogRepository;
        this.auditLogRepository = auditLogRepository;
    }

    private void logAction(Long adminId, String adminEmail, String action, String targetType, String targetId, String metadata) {
        AuditLog log = AuditLog.builder()
                .adminId(adminId)
                .adminEmail(adminEmail)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .metadata(metadata)
                .build();
        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);

        return AdminDashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalUrls(urlRepository.count())
                .totalClicks(clickLogRepository.count())
                .newUsersToday(userRepository.countByCreatedAtAfter(today))
                .newUsersThisWeek(userRepository.countByCreatedAtAfter(sevenDaysAgo))
                .newUrlsToday(urlRepository.countByCreatedAtAfter(today))
                .newUrlsThisWeek(urlRepository.countByCreatedAtAfter(sevenDaysAgo))
                .clicksToday(clickLogRepository.countByClickedAtAfter(today))
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserDto> getUsers(String search, Pageable pageable) {
        Page<User> usersPage;
        if (search != null && !search.isBlank()) {
            usersPage = userRepository.findByEmailContainingIgnoreCaseOrNameContainingIgnoreCase(search, search, pageable);
        } else {
            usersPage = userRepository.findAll(pageable);
        }
        return usersPage.map(this::mapToAdminUserDto);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDto getUserDetails(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        return mapToAdminUserDto(user);
    }

    @Override
    public void changeUserRole(Long userId, String roleStr, Long adminId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        Role newRole;
        try {
            newRole = Role.valueOf(roleStr);
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid role");
        }
        
        if (user.getId().equals(adminId)) {
            throw new BadRequestException("Cannot change your own role");
        }

        user.setRole(newRole);
        userRepository.save(user);
        logAction(adminId, adminEmail, "CHANGE_ROLE", "USER", user.getId().toString(), "Role changed to " + roleStr);
    }

    @Override
    public void changeUserStatus(Long userId, Boolean active, Long adminId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        if (user.getId().equals(adminId)) {
            throw new BadRequestException("Cannot disable your own account");
        }

        user.setActive(active);
        userRepository.save(user);
        logAction(adminId, adminEmail, active ? "ENABLE_USER" : "DISABLE_USER", "USER", user.getId().toString(), null);
    }

    @Override
    public void deleteUser(Long userId, Long adminId, String adminEmail) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));
        
        if (user.getId().equals(adminId)) {
            throw new BadRequestException("Cannot delete your own account");
        }
        
        user.setActive(false);
        userRepository.save(user);
        logAction(adminId, adminEmail, "SOFT_DELETE_USER", "USER", user.getId().toString(), null);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUrlDto> getUrls(String search, Pageable pageable) {
        // Simple implementation, advanced search omitted for brevity
        return urlRepository.findAll(pageable).map(this::mapToAdminUrlDto);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUrlDto getUrlDetails(Long urlId) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new BadRequestException("Url not found"));
        return mapToAdminUrlDto(url);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUrlDto> getUserUrls(Long userId, Pageable pageable) {
        return urlRepository.findByUserId(userId, pageable).map(this::mapToAdminUrlDto);
    }

    @Override
    public void changeUrlStatus(Long urlId, Boolean active, Long adminId, String adminEmail) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new BadRequestException("Url not found"));
        
        url.setActive(active);
        urlRepository.save(url);
        logAction(adminId, adminEmail, active ? "ENABLE_URL" : "DISABLE_URL", "URL", url.getId().toString(), url.getShortCode());
    }

    @Override
    public void deleteUrl(Long urlId, Long adminId, String adminEmail) {
        Url url = urlRepository.findById(urlId)
                .orElseThrow(() -> new BadRequestException("Url not found"));
        
        urlRepository.delete(url);
        logAction(adminId, adminEmail, "DELETE_URL", "URL", url.getId().toString(), url.getShortCode());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    private AdminUserDto mapToAdminUserDto(User user) {
        long urlCount = user.getUrls().size();
        long clickCount = user.getUrls().stream().mapToLong(url -> url.getClickCount()).sum();
        
        return AdminUserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .provider(user.getProvider().name())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .totalUrls(urlCount)
                .totalClicks(clickCount)
                .build();
    }

    private AdminUrlDto mapToAdminUrlDto(Url url) {
        return AdminUrlDto.builder()
                .id(url.getId())
                .originalUrl(url.getOriginalUrl())
                .shortCode(url.getShortCode())
                .clickCount(url.getClickCount())
                .active(url.getActive())
                .category(url.getCategory())
                .createdAt(url.getCreatedAt())
                .expiresAt(url.getExpiresAt())
                .ownerId(url.getUser().getId())
                .ownerEmail(url.getUser().getEmail())
                .build();
    }
}
