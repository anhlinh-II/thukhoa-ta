package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizHistoryDetailResponse {
    private Long historyId;
    private Long quizId;
    private Integer totalQuestions;
    private Integer correctCount;
    private List<HistoryQuestionDto> questions;
    // whether this quiz allows showing explanation HTML to users
    private Boolean isShowExplain;
}
