package com.example.quiz.model.entity.quiz_comment;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizCommentRequestDto {
    private Long quizId;
    private Long parentId;

    @NotBlank(message = "Content is required")
    private String content;
}
