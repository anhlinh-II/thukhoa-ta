package com.example.quiz.model.entity.quiz_mock_test;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.model.entity.quiz_group.QuizGroup;
import com.example.quiz.utils.SlugEntityListener;
import com.example.quiz.utils.Sluggable;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "quiz_mock_test")
@EntityListeners(SlugEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class QuizMockTest extends BaseEntity implements Sluggable {

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

    @Column(name = "exam_name", nullable = false, length = 255)
    private String examName; // "Đề thi thử THPT 2024 - Trần Hưng Đạo"

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(name = "shuffle_questions")
    @Builder.Default
    private Boolean shuffleQuestions = true;

    @Column(name = "show_results_immediately")
    @Builder.Default
    private Boolean showResultsImmediately = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_deleted")
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "is_show_answer")
    @Builder.Default
    private Boolean isShowAnswer = false;

    @Override
    public String getSlugSource() {
        return this.examName;
    }
}
