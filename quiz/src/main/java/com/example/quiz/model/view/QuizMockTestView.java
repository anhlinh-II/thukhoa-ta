package com.example.quiz.model.view;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Subselect("SELECT * FROM quiz_mock_test_view")
@Immutable
@Getter
@Setter
public class QuizMockTestView {

    @Id
    private Long id;

    @Column(name = "program_id")
    private Long programId;

    @Column(name = "quiz_group_id")
    private Long quizGroupId;

    private String title;

    private String description;

    private String slug;

    @Column(name = "exam_name")
    private String examName;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    private String instructions;

    @Column(name = "max_attempts")
    private Integer maxAttempts;

    @Column(name = "shuffle_questions")
    private Boolean shuffleQuestions;

    @Column(name = "show_results_immediately")
    private Boolean showResultsImmediately;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;
}
