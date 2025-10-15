package com.example.quiz.model.entity.user;

import com.example.quiz.enums.Gender;
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
    select * from user_view
""")
@Synchronize({"quizzes", "quiz_categories", "questions", "quiz_attempts"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserView {
    @Id
    private Long id;

    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String avatarUrl;

    private Instant dob;
    private Instant createdAt;
    private Instant updatedAt;

    private Gender gender;
}

