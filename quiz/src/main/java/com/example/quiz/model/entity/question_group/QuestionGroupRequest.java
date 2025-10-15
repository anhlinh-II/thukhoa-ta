package com.example.quiz.model.entity.question_group;

import jakarta.persistence.Column;
import lombok.Data;

@Data
public class QuestionGroupRequest {
    private Long id;

    private String title;

    private String contentHtml;

    private String mediaUrl;

    private String metadata;
}
