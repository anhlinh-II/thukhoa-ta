package com.example.quiz.model.dto.resquest;

import jakarta.persistence.Column;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuizCategoryRequest {
    private Long id;

    private String name;

    private String description;

    private String imageUrl;
}
