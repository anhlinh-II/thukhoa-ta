package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramResponseDto {

    private Long id;
    private String name;
    private String description;
    private Integer level;
    private String levelName; // "Beginner", "Intermediate", "Advanced"
    private Boolean isActive;
    private Integer displayOrder;
    
    private Long parentId;
    private String parentName;
    
    private List<ProgramResponseDto> children;
    private Integer childrenCount;
    private Integer quizCount;
    
    private Boolean isLeaf;
    private Boolean isRoot;
    private Integer depth;
    private String path; // Full path from root
    
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
}
