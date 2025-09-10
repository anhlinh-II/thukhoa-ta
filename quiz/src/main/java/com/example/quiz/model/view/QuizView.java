package com.example.quiz.model.view;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;
import org.hibernate.annotations.Synchronize;

import java.time.Instant;

@Immutable
@Entity
@Subselect("SELECT * FROM quiz_view")
@Synchronize({"quizzes", "quiz_categories", "questions", "quiz_attempts"})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QuizView {

    @Id
    private Long id;

    private String title;
    private String description;
    private Integer timeLimit;
    private Boolean isActive;
    private Integer difficultyLevel;
    private String coverImageUrl;
    private Instant createdAt;
    private Instant updatedAt;

    // Category info
    private Long categoryId;
    private String categoryName;
    private String categoryImageUrl;

    // Statistics
    private Integer questionCount;
    private Integer attemptCount;
}
