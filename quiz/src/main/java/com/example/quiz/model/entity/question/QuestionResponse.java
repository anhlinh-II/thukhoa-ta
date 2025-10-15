package com.example.quiz.model.entity.question;

import com.example.quiz.enums.QuestionType;
import jakarta.persistence.Column;
import jakarta.persistence.Id;
import lombok.Data;

import java.time.Instant;

@Data
public class QuestionResponse {
    private Long id;
    private QuestionType type;
    private Long groupId;
    private String contentHtml;
    private Double score;
    private int orderIndex;
    private String metadata;
    private String explanationHtml;
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
}
