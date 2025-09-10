package com.example.quiz.model.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTopicRequestDto {

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

    @Size(max = 1000, message = "Learning objectives must not exceed 1000 characters")
    private String learningObjectives;

    @Size(max = 1000, message = "Prerequisite topics must not exceed 1000 characters")
    private String prerequisiteTopics;

    private Integer displayOrder = 0;

    private Boolean isActive = true;
}
