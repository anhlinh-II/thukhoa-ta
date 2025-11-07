package com.example.quiz.model.entity.program;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgramRequestDto {

    @NotBlank(message = "Program name is required")
    @Size(max = 255, message = "Program name must not exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotNull(message = "Level is required")
    @Min(value = 1, message = "Level must be at least 1")
    @Max(value = 3, message = "Level must not exceed 3")
    private Integer level;

    @Builder.Default
    private Boolean isActive = true;

    @Builder.Default
    @Min(value = 0, message = "Display order must be non-negative")
    private Integer displayOrder = 0;

    private Long parentId;

    private String imageUrl;

}
