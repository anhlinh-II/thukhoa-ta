package com.example.quiz.service.quiz_comment;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.quiz_comment.QuizComment;
import com.example.quiz.model.entity.quiz_comment.QuizCommentRequestDto;
import com.example.quiz.model.entity.quiz_comment.QuizCommentResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface QuizCommentService extends BaseService<QuizComment, Long, QuizCommentRequestDto, QuizCommentResponseDto, QuizComment> {
    Page<QuizCommentResponseDto> findByQuizIdPaged(Long quizId, Pageable pageable);
    Page<QuizCommentResponseDto> findRepliesPaged(Long parentId, Pageable pageable);
    void flag(Long id, String reason);
}
