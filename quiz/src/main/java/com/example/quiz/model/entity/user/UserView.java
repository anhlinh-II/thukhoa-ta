package com.example.quiz.model.entity.user;

import com.example.quiz.enums.Gender;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;
import org.hibernate.annotations.Synchronize;

import java.time.Instant;

@Immutable
@Entity
@Subselect("""
    select * from users_view
""")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserView {
    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "username")
    private String username;

    @Column(name = "email")
    private String email;

    @Column(name = "first_name")
    private String firstName;


    @Column(name = "last_name")
    private String lastName;
    @Column(name = "phone")
    private String phone;
    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "dob")
    private Instant dob;
    @Column(name = "created_at")
    private Instant createdAt;
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "gender")
    private Gender gender;
}

