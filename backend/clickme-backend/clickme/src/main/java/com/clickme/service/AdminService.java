package com.clickme.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.clickme.dto.admin.AdminDashboardStats;
import com.clickme.dto.admin.AdminUrlDto;
import com.clickme.dto.admin.AdminUserDto;
import com.clickme.entity.AuditLog;

public interface AdminService {

    AdminDashboardStats getDashboardStats();

    Page<AdminUserDto> getUsers(String search, Pageable pageable);

    AdminUserDto getUserDetails(Long userId);

    void changeUserRole(Long userId, String role, Long adminId, String adminEmail);

    void changeUserStatus(Long userId, Boolean active, Long adminId, String adminEmail);

    void deleteUser(Long userId, Long adminId, String adminEmail);

    Page<AdminUrlDto> getUrls(String search, Pageable pageable);

    AdminUrlDto getUrlDetails(Long urlId);

    Page<AdminUrlDto> getUserUrls(Long userId, Pageable pageable);

    void changeUrlStatus(Long urlId, Boolean active, Long adminId, String adminEmail);

    void deleteUrl(Long urlId, Long adminId, String adminEmail);

    Page<AuditLog> getAuditLogs(Pageable pageable);
}
