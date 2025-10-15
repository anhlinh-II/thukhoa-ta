package com.example.quiz.model.entity.quiz_mock_test;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizMockTestResponseDto {

    private Long id;
    private Long quizGroup;
    private String title;
    private String description;
    private String slug;
    private String examName;
    private Integer durationMinutes;
    private Integer totalQuestions;
    private String instructions;
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
    private String groupName;
}
