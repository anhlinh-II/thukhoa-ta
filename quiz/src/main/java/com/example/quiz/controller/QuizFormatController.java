package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.validators.requirePermission.RequirePermission;
import com.example.quiz.validators.requirePermission.ResourceController;
import com.example.quiz.model.dto.request.QuizFormatRequestDto;
import com.example.quiz.model.dto.response.QuizFormatResponseDto;
import com.example.quiz.model.entity.QuizFormat;
import com.example.quiz.model.view.QuizFormatView;
import com.example.quiz.service.QuizFormatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/quiz-formats")
@ResourceController("QUIZ_FORMAT")
public class QuizFormatController extends BaseController<QuizFormat, Long, QuizFormatRequestDto, QuizFormatResponseDto, QuizFormatView, QuizFormatService> {

    public QuizFormatController(QuizFormatService quizFormatService) {
        super(quizFormatService);
    }

    @GetMapping("/quiz-group/{quizGroupId}")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<List<QuizFormatResponseDto>> getQuizFormatsByQuizGroupId(@PathVariable Long quizGroupId) {
        log.info("Getting quiz formats by quiz group id: {}", quizGroupId);
        List<QuizFormatResponseDto> quizFormats = service.findByQuizGroupId(quizGroupId);
        return ResponseEntity.ok(quizFormats);
    }

//     @GetMapping("/format-type/{formatType}")
//     @RequirePermission(resource = "", action = "READ")
//     public ResponseEntity<List<QuizFormatResponseDto>> getQuizFormatsByFormatType(@PathVariable String formatType) {
//         log.info("Getting quiz formats by format type: {}", formatType);
//         QuizFormat.FormatType type = QuizFormat.FormatType.valueOf(formatType.toUpperCase());
//         List<QuizFormatResponseDto> quizFormats = service.findByFormatType(type);
//         return ResponseEntity.ok(quizFormats);
//     }

//     @GetMapping("/quiz-group/{quizGroupId}/format-type/{formatType}")
//     @RequirePermission(resource = "", action = "READ")
//     public ResponseEntity<List<QuizFormatResponseDto>> getQuizFormatsByQuizGroupIdAndFormatType(
//             @PathVariable Long quizGroupId, @PathVariable String formatType) {
//         log.info("Getting quiz formats by quiz group id: {} and format type: {}", quizGroupId, formatType);
//         QuizFormat.FormatType type = QuizFormat.FormatType.valueOf(formatType.toUpperCase());
//         List<QuizFormatResponseDto> quizFormats = service.findByQuizGroupIdAndFormatType(quizGroupId, type);
//         return ResponseEntity.ok(quizFormats);
//     }

    @GetMapping("/quiz-group/{quizGroupId}/active")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<List<QuizFormatResponseDto>> getActiveQuizFormatsByQuizGroupId(@PathVariable Long quizGroupId) {
        log.info("Getting active quiz formats by quiz group id: {}", quizGroupId);
        List<QuizFormatResponseDto> quizFormats = service.findActiveByQuizGroupId(quizGroupId);
        return ResponseEntity.ok(quizFormats);
    }

    @GetMapping("/{id}/details")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<QuizFormatResponseDto> getQuizFormatById(@PathVariable Long id) {
        log.info("Getting quiz format by id: {}", id);
        QuizFormatResponseDto quizFormat = service.getQuizFormatById(id);
        return ResponseEntity.ok(quizFormat);
    }

    @GetMapping("/slug/{slug}")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<QuizFormatResponseDto> getQuizFormatBySlug(@PathVariable String slug) {
        log.info("Getting quiz format by slug: {}", slug);
        QuizFormatResponseDto quizFormat = service.findBySlug(slug);
        return ResponseEntity.ok(quizFormat);
    }

    @GetMapping("/time-limit/{timeLimit}")
    @RequirePermission(resource = "", action = "READ")
    public ResponseEntity<List<QuizFormatResponseDto>> getQuizFormatsByTimeLimit(@PathVariable Integer timeLimit) {
        log.info("Getting quiz formats by time limit: {}", timeLimit);
        List<QuizFormatResponseDto> quizFormats = service.findByTimeLimit(timeLimit);
        return ResponseEntity.ok(quizFormats);
    }

//     @GetMapping("/count/format-type/{formatType}")
//     @RequirePermission(resource = "", action = "READ")
//     public ResponseEntity<Long> countQuizFormatsByFormatType(@PathVariable String formatType) {
//         log.info("Counting quiz formats by format type: {}", formatType);
//         QuizFormat.FormatType type = QuizFormat.FormatType.valueOf(formatType.toUpperCase());
//         Long count = service.countByFormatType(type);
//         return ResponseEntity.ok(count);
//     }

    @DeleteMapping("/{id}/soft")
    @RequirePermission(resource = "", action = "DELETE")
    public ResponseEntity<Void> softDeleteQuizFormat(@PathVariable Long id) {
        log.info("Soft deleting quiz format with id: {}", id);
        service.softDeleteById(id);
        return ResponseEntity.noContent().build();
    }
}
