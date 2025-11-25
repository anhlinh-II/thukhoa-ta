package com.example.quiz.model.dto.vocab;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestDto {
    private Long userId;
    private Integer optionsCount = 4;
    private Long vocabId; // optional: if provided, build question for this vocab
}
