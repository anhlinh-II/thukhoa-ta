package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizFormatResponseDto {

    private Long id;
    private Long programId;
    private Long quizGroupId;
    private String title;
    private String description;
    private String slug;
    private Integer timeLimitSeconds;
    private Boolean showAnswerAfterSubmit;
    private Boolean shuffleQuestions;
    private Integer displayOrder;
    private Boolean isActive;
    private Boolean isDeleted;
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
}
