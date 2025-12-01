package com.example.quiz.model.entity.user;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.enums.Gender;
import com.example.quiz.model.entity.role_permission.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.Set;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class User extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    // OAuth2 fields
    private String googleId;
    private String firstName;
    private String lastName;
    private String fullName;
    private String locale;

    private String phone;

    private Instant dob;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String bio;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(columnDefinition = "MEDIUMTEXT")
    private String refreshToken;

    private String otp;
    private Instant otpGeneratedTime;
    private boolean isActive;
    private boolean isDelete;

    // Reset password fields
    @Column(name = "reset_password_token")
    private String resetPasswordToken;
    
    @Column(name = "reset_password_token_expiry")
    private Instant resetPasswordTokenExpiry;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> authorities;
}
