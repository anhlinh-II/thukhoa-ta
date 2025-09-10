package com.example.quiz.model.dto.response;

import lombok.Data;
import java.time.Instant;

@Data
public class QuizCategoryResponse {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Boolean isActive;
    private Boolean isDelete;
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
}
