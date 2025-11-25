package com.example.quiz.model.dto.vocab;

import lombok.Data;
import java.util.Map;

@Data
public class SaveVocabRequest {
    private String word;
    private Map<String, Object> data;
}
