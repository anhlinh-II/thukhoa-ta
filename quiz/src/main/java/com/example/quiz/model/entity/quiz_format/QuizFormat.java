package com.example.quiz.model.entity.quiz_format;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.model.entity.quiz_group.QuizGroup;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "quiz_format")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class QuizFormat extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_group_id", nullable = false)
    private QuizGroup quizGroup;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column(name = "show_answer_after_submit")
    @Builder.Default
    private Boolean showAnswerAfterSubmit = true;

    @Column(name = "shuffle_questions")
    @Builder.Default
    private Boolean shuffleQuestions = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;
}
