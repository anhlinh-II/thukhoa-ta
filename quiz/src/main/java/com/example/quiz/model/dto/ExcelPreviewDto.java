package com.example.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelPreviewDto {
    private List<QuestionGroupExcelDto> questionGroups;
    private List<QuestionExcelDto> questions;
    private List<QuestionOptionExcelDto> questionOptions;
    private List<String> errors;
}
