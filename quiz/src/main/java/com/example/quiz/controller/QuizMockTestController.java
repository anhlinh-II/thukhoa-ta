package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.response.SubmitQuizResponse;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestRequestDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestResponseDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestView;
import com.example.quiz.service.quiz_mock_test.QuizMockTestService;
import com.example.quiz.validators.requirePermission.RequirePermission;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/quiz-mock-tests")
@ResourceController("QUIZ_MOCK_TEST")
@Slf4j
public class QuizMockTestController extends BaseController<QuizMockTest, Long, QuizMockTestRequestDto, QuizMockTestResponseDto, QuizMockTestView, QuizMockTestService> {
    
    private final QuizMockTestService quizMockTestService;
    
    public QuizMockTestController(QuizMockTestService service) {
        super(service);
        this.quizMockTestService = service;
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<SubmitQuizResponse>> submitQuiz(@PathVariable Long id, @RequestBody com.example.quiz.model.dto.request.SubmitQuizRequest request) {
        String username = com.example.quiz.utils.SecurityUtils.getCurrentUserLogin().orElse("");
        SubmitQuizResponse result = quizMockTestService.submitQuiz(id, request, username);
        return ResponseEntity.ok(ApiResponse.successOf(result));
    }

    @GetMapping("/{id}/preview")
//    @RequirePermission(resource = "QUIZ_MOCK_TEST", action = "READ") alo nguyễn thị thùy vân heheheheheheh hihihahaha
    public ResponseEntity<Map<String, Object>> previewQuiz(@PathVariable Long id) {
        log.info("Fetching preview for quiz mock test id: {}", id);
        Map<String, Object> preview = quizMockTestService.getQuizPreview(id);
        return ResponseEntity.ok(preview);
    }
}
