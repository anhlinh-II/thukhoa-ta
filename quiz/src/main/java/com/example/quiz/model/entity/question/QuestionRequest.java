package com.example.quiz.model.entity.question;

import com.example.quiz.enums.QuestionType;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;

@Data
public class QuestionRequest {
    private Long id;

    private QuestionType type;

    private Long groupId;

    private String contentHtml;

    private Double score;

    private int orderIndex;

    private String metadata;

    private String explanationHtml;
}
