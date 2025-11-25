package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.quiz_comment.QuizComment;
import com.example.quiz.model.entity.quiz_comment.QuizCommentRequestDto;
import com.example.quiz.model.entity.quiz_comment.QuizCommentResponseDto;
import com.example.quiz.service.quiz_comment.QuizCommentService;
import com.example.quiz.validators.requirePermission.ResourceController;
import com.example.quiz.model.dto.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/quiz-comments")
@ResourceController("QUIZ_COMMENT")
@Slf4j
public class QuizCommentController extends BaseController<QuizComment, Long, QuizCommentRequestDto, QuizCommentResponseDto, QuizComment, QuizCommentService> {

    private final QuizCommentService commentService;

    public QuizCommentController(QuizCommentService service) {
        super(service);
        this.commentService = service;
    }

    @GetMapping("/by-quiz/{quizId}")
    public ApiResponse<Page<QuizCommentResponseDto>> byQuiz(@PathVariable Long quizId, Pageable pageable) {
        Page<QuizCommentResponseDto> page = commentService.findByQuizIdPaged(quizId, pageable);
        return ApiResponse.successOf(page);
    }

    @GetMapping("/{id}/replies")
    public ApiResponse<Page<QuizCommentResponseDto>> replies(@PathVariable Long id, Pageable pageable) {
        Page<QuizCommentResponseDto> page = commentService.findRepliesPaged(id, pageable);
        return ApiResponse.successOf(page);
    }

    @PostMapping("/{id}/flag")
    public ApiResponse<Boolean> flag(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        String reason = null;
        if (body != null) reason = body.get("reason");
        commentService.flag(id, reason);
        return ApiResponse.successOf(Boolean.TRUE);
    }
}
