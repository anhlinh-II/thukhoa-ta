package com.example.quiz.model.entity.quiz_mock_test;

import com.example.quiz.model.entity.question.QuestionRequest;
import com.example.quiz.model.entity.question_group.QuestionGroupRequest;
import com.example.quiz.model.entity.question_option.QuestionOptionRequest;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizMockTestRequestDto {

    @NotNull(message = "Quiz Group ID is required")
    private Long quizGroup;

    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotBlank(message = "Exam name is required")
    @Size(max = 255, message = "Exam name must not exceed 255 characters")
    private String examName;

    @Positive(message = "Duration must be positive")
    @Max(value = 600, message = "Duration must not exceed 600 minutes")
    private Integer durationMinutes;

    @Positive(message = "Total questions must be positive")
    @Max(value = 500, message = "Total questions must not exceed 500")
    private Integer totalQuestions;

    @DecimalMin(value = "0.0", message = "Passing score must be at least 0")
    @DecimalMax(value = "100.0", message = "Passing score must not exceed 100")
    private BigDecimal passingScore;

    @Size(max = 2000, message = "Instructions must not exceed 2000 characters")
    private String instructions;

    private Boolean shuffleQuestions = true;

    private Boolean showResultsImmediately = false;

    private Boolean certificateEligible = false;

    private Integer displayOrder = 0;

    private Boolean isActive = true;

    // Nested question creation support
    private List<QuestionGroupWithQuestionsDto> questionGroups;
    private List<QuestionWithOptionsDto> standaloneQuestions;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionGroupWithQuestionsDto {
        private QuestionGroupRequest group;
        private List<QuestionWithOptionsDto> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionWithOptionsDto {
        private QuestionRequest question;
        private List<QuestionOptionRequest> options;
    }
}
