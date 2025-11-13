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
}
