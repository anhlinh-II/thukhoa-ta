package com.example.quiz.model.entity.user_quiz_mock_his;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.Instant;

@Entity
@Subselect("SELECT * FROM user_quiz_mock_his_view")
@Immutable
@Getter
@Setter
public class UserQuizMockHisView {

    @Id
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "quiz_mock_test_id")
    private Long quizMockTestId;

    private Double score;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "created_at")
    private Instant createdAt;

}
