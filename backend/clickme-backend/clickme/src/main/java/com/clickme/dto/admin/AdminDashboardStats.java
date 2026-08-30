package com.clickme.dto.admin;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminDashboardStats {
    private long totalUsers;
    private long totalUrls;
    private long totalClicks;
    private long newUsersToday;
    private long newUsersThisWeek;
    private long newUrlsToday;
    private long newUrlsThisWeek;
    private long clicksToday;
}
