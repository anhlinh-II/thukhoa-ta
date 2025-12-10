package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserQuizHisResponse {
    private Long id;
    private Long quizMockTestId;
    private Double score;
    private Integer totalQuestions;
    private Integer correctCount;
    private Instant createdAt;
    private String quizType;
    private String examName;

    public UserQuizHisResponse(Long id, Long quizMockTestId, Double score, Integer totalQuestions, Integer correctCount, Instant createdAt, String quizType) {
        this.id = id;
        this.quizMockTestId = quizMockTestId;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.correctCount = correctCount;
        this.createdAt = createdAt;
        this.quizType = quizType;
    }
}
