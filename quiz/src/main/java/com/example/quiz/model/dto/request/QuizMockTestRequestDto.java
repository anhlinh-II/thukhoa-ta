package com.example.quiz.model.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizMockTestRequestDto {

    @NotNull(message = "Program ID is required")
    private Long programId;

    @NotNull(message = "Quiz Group ID is required")
    private Long quizGroupId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotBlank(message = "Slug is required")
    @Size(max = 255, message = "Slug must not exceed 255 characters")
    private String slug;

    @NotBlank(message = "Exam name is required")
    @Size(max = 255, message = "Exam name must not exceed 255 characters")
    private String examName;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    @Max(value = 600, message = "Duration must not exceed 600 minutes")
    private Integer durationMinutes;

    @NotNull(message = "Total questions is required")
    @Positive(message = "Total questions must be positive")
    @Max(value = 500, message = "Total questions must not exceed 500")
    private Integer totalQuestions;

    @NotNull(message = "Passing score is required")
    @DecimalMin(value = "0.0", message = "Passing score must be at least 0")
    @DecimalMax(value = "100.0", message = "Passing score must not exceed 100")
    private BigDecimal passingScore;

    @Size(max = 2000, message = "Instructions must not exceed 2000 characters")
    private String instructions;

    @Positive(message = "Max attempts must be positive")
    @Max(value = 10, message = "Max attempts must not exceed 10")
    private Integer maxAttempts = 3;

    private Boolean shuffleQuestions = true;

    private Boolean showResultsImmediately = false;

    private Boolean certificateEligible = false;

    private Integer displayOrder = 0;

    private Boolean isActive = true;
}
