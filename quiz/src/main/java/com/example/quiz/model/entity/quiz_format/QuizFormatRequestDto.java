package com.example.quiz.model.entity.quiz_format;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizFormatRequestDto {

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

    @Positive(message = "Time limit must be positive")
    private Integer timeLimitSeconds;

    private Boolean showAnswerAfterSubmit = true;

    private Boolean shuffleQuestions = false;

    private Integer displayOrder = 0;

    private Boolean isActive = true;
}
