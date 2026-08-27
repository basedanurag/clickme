package com.clickme.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clickme.entity.ClickLog;

public interface ClickLogRepository extends JpaRepository<ClickLog, Long> {

    long countByUrlId(Long urlId);

    long countByUrlIdAndClickedAtAfter(Long urlId, LocalDateTime dateTime);

    List<ClickLog> findByUrlId(Long urlId);

}