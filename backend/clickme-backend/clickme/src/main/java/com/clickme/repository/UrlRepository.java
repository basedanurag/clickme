package com.clickme.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.clickme.entity.Url;
import com.clickme.entity.User;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {

    Optional<Url> findByShortCode(String shortCode);

    List<Url> findByUser(User user);

    boolean existsByShortCode(String shortCode);

    Optional<Url> findByIdAndUser(Long id, User user);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.data.jpa.repository.Query("UPDATE Url u SET u.clickCount = u.clickCount + 1 WHERE u.id = :id")
    void incrementClickCount(@org.springframework.data.repository.query.Param("id") Long id);

    long countByCreatedAtAfter(java.time.LocalDateTime date);

    org.springframework.data.domain.Page<Url> findAll(org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<Url> findByUserId(Long userId, org.springframework.data.domain.Pageable pageable);
}