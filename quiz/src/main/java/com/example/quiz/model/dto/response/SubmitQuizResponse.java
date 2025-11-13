package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizResponse {
    private Double score; // on scale 10
    private Integer totalQuestions;
    private Integer correctCount;
    // only present when quiz.isShowAnswer == true
    private List<Map<String, Object>> answers; // list of {questionId, correctOptionId, yourOptionId, isCorrect, explanationHtml}
}
