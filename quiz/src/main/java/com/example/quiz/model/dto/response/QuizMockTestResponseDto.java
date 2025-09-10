package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizMockTestResponseDto {

    private Long id;
    private Long programId;
    private Long quizGroupId;
    private String title;
    private String description;
    private String slug;
    private String examName;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private BigDecimal passingScore;
    private String instructions;
    private Integer maxAttempts;
    private Boolean shuffleQuestions;
    private Boolean showResultsImmediately;
    private Boolean certificateEligible;
    private Integer displayOrder;
    private Boolean isActive;
    private Boolean isDeleted;
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
}
