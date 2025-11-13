package com.example.quiz.controller;

import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.response.UserQuizHisResponse;
import com.example.quiz.service.user_quiz_history.UserQuizMockHisService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/quiz-history")
@Slf4j
public class UserQuizHistoryController {

    private final UserQuizMockHisService userQuizMockHisService;

    public UserQuizHistoryController(UserQuizMockHisService userQuizMockHisService) {
        this.userQuizMockHisService = userQuizMockHisService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserQuizHisResponse>>> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<UserQuizHisResponse> p = userQuizMockHisService.getMyHistory(page, size);
        return ResponseEntity.ok(ApiResponse.successOf(p));
    }
}
