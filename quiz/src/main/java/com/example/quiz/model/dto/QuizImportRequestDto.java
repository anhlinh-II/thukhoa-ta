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
public class QuizImportRequestDto {
    private List<TextElementDto> elements;
    private String quizName;
    private Integer durationMinutes;
    private Long quizGroupId;
    private String description;
}
