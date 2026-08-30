package com.clickme.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.clickme.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    long countByActiveTrue();

    long countByCreatedAtAfter(java.time.LocalDateTime date);

    org.springframework.data.domain.Page<User> findAll(org.springframework.data.domain.Pageable pageable);

    org.springframework.data.domain.Page<User> findByEmailContainingIgnoreCaseOrNameContainingIgnoreCase(String email, String name, org.springframework.data.domain.Pageable pageable);
}