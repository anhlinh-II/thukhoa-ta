package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoryQuestionDto {
    private Long questionId;
    private Integer index; // 1-based
    private Long correctOptionId;
    private Long userOptionId;
    private Boolean isCorrect;
}
