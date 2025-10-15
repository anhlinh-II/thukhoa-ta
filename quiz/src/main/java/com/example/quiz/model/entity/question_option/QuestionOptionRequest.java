package com.example.quiz.model.entity.question_option;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class QuestionOptionRequest {
    private Long id;

    private Long questionId;

    private String contentHtml;

    private Boolean isCorrect;

    private String matchKey;

    private int orderIndex;
}
