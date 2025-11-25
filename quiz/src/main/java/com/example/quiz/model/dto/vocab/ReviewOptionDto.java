package com.example.quiz.model.dto.vocab;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewOptionDto {
    private String id; // stable id for option (could be generated)
    private String text; // the definition text to show
    private String source; // 'user' or 'pool'
}
