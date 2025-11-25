package com.example.quiz.model.dto.vocab;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReviewQuestionDto {
    private Long vocabId; // id of the UserVocabulary used
    private String word;
    private String prompt; // e.g., "Choose the correct definition for"
    private List<ReviewOptionDto> options;
    private int correctIndex; // index in options list
    private Double ease; // current ease (ef) value for this vocab, nullable for curated pool
}
