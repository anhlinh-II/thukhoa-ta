package com.example.quiz.model.entity.question_option;

import jakarta.persistence.Column;
import lombok.Data;

import java.time.Instant;

@Data
public class QuestionOptionResponse {
    private Long id;
    private Long questionId;
    private String contentHtml;
    private Boolean isCorrect;
    private String matchKey;
    private int orderIndex;
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
}
