package com.example.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionExcelDto {
    private String id;
    private String groupRef;
    private String type;
    private String contentHtml;
    private Integer order;
    private Double score;
    private String explanationHtml;
}
