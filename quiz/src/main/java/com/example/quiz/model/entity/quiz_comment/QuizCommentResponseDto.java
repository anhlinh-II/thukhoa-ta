package com.example.quiz.model.entity.quiz_comment;

import com.example.quiz.model.entity.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizCommentResponseDto {
    private Long id;
    private Long quizId;
    private Long parentId;
    private String content;
    private Boolean isDeleted;
    private Boolean isFlagged;
    private Instant createdAt;
    private String createdBy;
    private Instant updatedAt;
    private String updatedBy;
    private UserResponse createdByUser;
    private Integer childrenCount;
    private List<QuizCommentResponseDto> children;
}
