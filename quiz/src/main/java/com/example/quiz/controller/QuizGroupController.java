package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.validators.requirePermission.RequirePermission;
import com.example.quiz.validators.requirePermission.ResourceController;
import com.example.quiz.model.dto.request.QuizGroupRequestDto;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.dto.response.QuizGroupResponseDto;
import com.example.quiz.model.entity.QuizGroup;
import com.example.quiz.model.view.QuizGroupView;
import com.example.quiz.service.QuizGroupService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quiz-groups")
@ResourceController("QUIZ_GROUP")
@Slf4j
public class QuizGroupController extends BaseController<QuizGroup, Long, QuizGroupRequestDto, QuizGroupResponseDto, QuizGroupView, QuizGroupService> {

    public QuizGroupController(QuizGroupService quizGroupService) {
        super(quizGroupService);
    }

    @GetMapping("/exists-slug/{slug}")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<ApiResponse<Boolean>> existsBySlug(@PathVariable String slug) {
        log.info("Checking if slug exists: {}", slug);
        boolean exists = service.existsBySlug(slug);
        return ResponseEntity.ok(ApiResponse.successOf(exists));
    }
}
