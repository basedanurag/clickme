package com.clickme.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clickme.dto.admin.AdminDashboardStats;
import com.clickme.dto.admin.AdminUrlDto;
import com.clickme.dto.admin.AdminUserDto;
import com.clickme.dto.admin.ChangeRoleRequest;
import com.clickme.dto.admin.ChangeStatusRequest;
import com.clickme.entity.AuditLog;
import com.clickme.security.CustomUserDetails;
import com.clickme.service.AdminService;
import com.clickme.util.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getStats() {
        return ResponseEntity.ok(ApiResponse.success("Stats retrieved", adminService.getDashboardStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<AdminUserDto>>> getUsers(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Users retrieved", adminService.getUsers(search, pageable)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUserDto>> getUserDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User retrieved", adminService.getUserDetails(id)));
    }

    @GetMapping("/users/{id}/urls")
    public ResponseEntity<ApiResponse<Page<AdminUrlDto>>> getUserUrls(
            @PathVariable Long id,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("User URLs retrieved", adminService.getUserUrls(id, pageable)));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<ApiResponse<Void>> changeUserRole(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRoleRequest request,
            @AuthenticationPrincipal CustomUserDetails admin) {
        adminService.changeUserRole(id, request.getRole(), admin.getUser().getId(), admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Role updated", null));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> changeUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails admin) {
        adminService.changeUserStatus(id, request.getActive(), admin.getUser().getId(), admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin) {
        adminService.deleteUser(id, admin.getUser().getId(), admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User soft deleted", null));
    }

    @GetMapping("/urls")
    public ResponseEntity<ApiResponse<Page<AdminUrlDto>>> getUrls(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("URLs retrieved", adminService.getUrls(search, pageable)));
    }

    @GetMapping("/urls/{id}")
    public ResponseEntity<ApiResponse<AdminUrlDto>> getUrlDetails(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("URL retrieved", adminService.getUrlDetails(id)));
    }

    @PatchMapping("/urls/{id}/status")
    public ResponseEntity<ApiResponse<Void>> changeUrlStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails admin) {
        adminService.changeUrlStatus(id, request.getActive(), admin.getUser().getId(), admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Status updated", null));
    }

    @DeleteMapping("/urls/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUrl(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails admin) {
        adminService.deleteUrl(id, admin.getUser().getId(), admin.getUsername());
        return ResponseEntity.ok(ApiResponse.success("URL deleted", null));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", adminService.getAuditLogs(pageable)));
    }
}
