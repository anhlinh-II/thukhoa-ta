package com.example.quiz.model.entity.quiz_group;

import com.example.quiz.enums.GroupType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizGroupRequestDto {

    private Long programId;

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private String slug;

    private GroupType groupType;

    private Integer displayOrder = 0;

    private Boolean isActive = true;
}
