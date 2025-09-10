package com.example.quiz.model.dto.request;

import com.example.quiz.model.entity.QuizGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizGroupRequestDto {

    @NotNull(message = "Program ID is required")
    private Long programId;

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotBlank(message = "Slug is required")
    @Size(max = 255, message = "Slug must not exceed 255 characters")
    private String slug;

    @NotNull(message = "Group type is required")
    private QuizGroup.GroupType groupType;

    private Integer displayOrder = 0;

    private Boolean isActive = true;
}
