package com.example.quiz.model.entity.question_group;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import lombok.Data;

@Data
public class QuestionGroupResponse {
    private Long id;

    private String title;

    private String contentHtml;

    private String mediaUrl;

    private String metadata;
}
