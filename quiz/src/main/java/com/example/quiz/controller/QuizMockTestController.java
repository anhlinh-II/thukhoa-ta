package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestRequestDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestResponseDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestView;
import com.example.quiz.service.quiz_mock_test.QuizMockTestService;
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

    @GetMapping("/{id}/preview")
    public ResponseEntity<Map<String, Object>> previewQuiz(@PathVariable Long id) {
        log.info("Fetching preview for quiz mock test id: {}", id);
        Map<String, Object> preview = quizMockTestService.getQuizPreview(id);
        return ResponseEntity.ok(preview);
    }
}
