package com.example.quiz.model.entity.quiz_group;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizGroupResponseDto {

    private Long id;
    private Long programId;
    private String name;
    private String description;
    private String slug;
    private QuizGroup.GroupType groupType;
    private Integer displayOrder;
    private Boolean isActive;
    private Boolean isDeleted;
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
    private Integer totalMockTest;
}
