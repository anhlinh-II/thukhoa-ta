package com.example.quiz.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TextElementDto {
    private String id;
    private ElementType type;
    private String text;
    private Integer order;

    public enum ElementType {
        GROUP, QUESTION, OPTION, ANSWER, CONTENT
    }
}
