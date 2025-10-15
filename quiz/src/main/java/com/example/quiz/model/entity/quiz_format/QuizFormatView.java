package com.example.quiz.model.entity.quiz_format;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.Instant;

@Entity
@Subselect("SELECT * FROM quiz_format_view")
@Immutable
@Getter
@Setter
public class QuizFormatView {

    @Id
    private Long id;

    @Column(name = "quiz_group_id")
    private Long quizGroupId;

    private String title;

    private String description;

    private String slug;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column(name = "show_answer_after_submit")
    private Boolean showAnswerAfterSubmit;

    @Column(name = "shuffle_questions")
    private Boolean shuffleQuestions;

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
