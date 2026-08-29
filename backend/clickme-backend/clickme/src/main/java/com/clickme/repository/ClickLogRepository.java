package com.clickme.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clickme.entity.ClickLog;

public interface ClickLogRepository extends JpaRepository<ClickLog, Long> {

    long countByUrlId(Long urlId);

    long countByUrlIdAndClickedAtAfter(Long urlId, LocalDateTime dateTime);

    // Kept for daily-chart calculation (7 rows max — acceptable)
    List<ClickLog> findByUrlId(Long urlId);

    // ---------------------------------------------------------------
    // Aggregate queries — let the DB group instead of loading all rows
    // ---------------------------------------------------------------

    /** Returns [browser, count] pairs for a URL. */
    @Query("SELECT c.browser, COUNT(c) FROM ClickLog c WHERE c.url.id = :urlId GROUP BY c.browser")
    List<Object[]> countByBrowserForUrl(@Param("urlId") Long urlId);

    /** Returns [operatingSystem, count] pairs for a URL. */
    @Query("SELECT c.operatingSystem, COUNT(c) FROM ClickLog c WHERE c.url.id = :urlId GROUP BY c.operatingSystem")
    List<Object[]> countByOsForUrl(@Param("urlId") Long urlId);

    /** Returns [device, count] pairs for a URL. */
    @Query("SELECT c.device, COUNT(c) FROM ClickLog c WHERE c.url.id = :urlId GROUP BY c.device")
    List<Object[]> countByDeviceForUrl(@Param("urlId") Long urlId);

    /** Returns [referer, count] pairs for a URL. */
    @Query("SELECT c.referer, COUNT(c) FROM ClickLog c WHERE c.url.id = :urlId GROUP BY c.referer")
    List<Object[]> countByRefererForUrl(@Param("urlId") Long urlId);
}