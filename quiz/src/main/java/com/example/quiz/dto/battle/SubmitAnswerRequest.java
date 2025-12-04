package com.example.quiz.dto.battle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerRequest {
    private Long battleId;
    private Long userId;
    private Long questionId;
    private String answer;
    private Long timestamp;
    private Integer timeTaken;
}
