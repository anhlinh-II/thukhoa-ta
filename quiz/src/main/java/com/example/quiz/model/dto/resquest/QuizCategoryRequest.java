package com.example.quiz.model.dto.resquest;

import lombok.*;

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
