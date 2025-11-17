package com.example.quiz.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitQuizRequest {
    // questionId -> selectedOptionId
    private Map<Long, Long> answers;
    // time spent in minutes
    private Integer timeSpent;
}
