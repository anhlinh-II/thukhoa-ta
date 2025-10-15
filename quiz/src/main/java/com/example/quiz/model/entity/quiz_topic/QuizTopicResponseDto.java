package com.example.quiz.model.entity.quiz_topic;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizTopicResponseDto {

    private Long id;
    private Long quizGroupId;
    private String title;
    private String description;
    private String slug;
    private String learningObjectives;
    private String prerequisiteTopics;
    private Integer displayOrder;
    private Boolean isActive;
    private Boolean isDeleted;
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
}
