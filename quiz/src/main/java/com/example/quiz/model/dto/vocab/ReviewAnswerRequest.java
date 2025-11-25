package com.example.quiz.model.dto.vocab;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewAnswerRequest {
    private Long userId;
    private Double quality;
    private Long timeSpentMillis;
}
