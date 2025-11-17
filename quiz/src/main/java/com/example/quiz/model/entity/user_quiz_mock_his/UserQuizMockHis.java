package com.example.quiz.model.entity.user_quiz_mock_his;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.enums.GroupType;
import com.example.quiz.model.entity.quiz_group.QuizGroup;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "user_quiz_mock_his")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class UserQuizMockHis extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "quiz_mock_test_id", nullable = false)
    private Long quizMockTestId;

    @Column(name = "score")
    private Double score;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "quiz_type")
    @Enumerated(EnumType.STRING)
    private GroupType quizType;

    @Column(name = "time_spent")
    private Integer timeSpent;
}
