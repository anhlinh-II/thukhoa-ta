package com.example.quiz.model.dto.vocab;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewBatchRequestDto {
    private Long userId;
    private Integer optionsCount = 4;
    private Integer questionsCount = 10; // how many questions to build (max)
}
