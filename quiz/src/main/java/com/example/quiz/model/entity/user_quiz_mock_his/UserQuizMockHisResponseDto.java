package com.example.quiz.model.entity.user_quiz_mock_his;

import lombok.Data;

import java.time.Instant;

@Data
public class UserQuizMockHisResponseDto {
    private Long id;
    private Long quizMockTestId;
    private Double score;
    private Integer totalQuestions;
    private Integer correctCount;
    private Instant createdAt;
}
