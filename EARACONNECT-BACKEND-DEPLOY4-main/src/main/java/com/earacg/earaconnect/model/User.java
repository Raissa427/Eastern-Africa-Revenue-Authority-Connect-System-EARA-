package com.earacg.earaconnect.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "phone")
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private UserRole role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "country_id")
    @JsonIgnoreProperties({"eac"})
    private Country country;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subcommittee_id")
    @JsonIgnoreProperties({"members", "parentCommittee"})
    private SubCommittee subcommittee;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
    
    @Column(name = "is_first_login")
    private Boolean firstLogin = true;
    
    @Column(name = "password_reset_required")
    private Boolean passwordResetRequired = false;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "department")
    private String department;
    
    @Column(name = "position")
    private String position;

    @Column(name = "profile_picture")
    private String profilePicture;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum UserRole {
        ADMIN,
        SECRETARY,
        CHAIR,
        VICE_CHAIR,
        HOD,
        COMMISSIONER_GENERAL,
        SUBCOMMITTEE_MEMBER,
        DELEGATION_SECRETARY,
        COMMITTEE_SECRETARY,
        COMMITTEE_MEMBER
    }
} 