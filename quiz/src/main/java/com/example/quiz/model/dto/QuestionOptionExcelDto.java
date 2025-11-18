package com.example.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionOptionExcelDto {
    private String questionId;
    private Boolean isCorrect;
    private String contentHtml;
    private String matchKey;
    private Integer order;
}
