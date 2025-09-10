package com.example.quiz.model.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuizResponse {
    private Long id;
    private String title;
    private String description;
    private Integer timeLimit;
    private Boolean isActive;
    private Integer difficultyLevel;
    private String coverImageUrl;

    // Thông tin category
    private CategoryInfo category;

    // Thống kê (có thể null)
    private QuizStats stats;

    // Timestamps
    private Instant createdAt;
    private Instant updatedAt;

    // Danh sách câu hỏi (có thể null)
//    private List<QuestionResponse> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String imageUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizStats {
        private Integer totalQuestions;
        private Integer totalParticipants;
        private Double averageScore;
    }
}
