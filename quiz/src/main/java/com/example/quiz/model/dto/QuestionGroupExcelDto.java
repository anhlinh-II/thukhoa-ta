package com.example.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionGroupExcelDto {
    private String groupId;
    private String title;
    private String contentHtml;
    private String mediaUrl;
}
