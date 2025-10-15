package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.validators.requirePermission.ResourceController;
import com.example.quiz.model.entity.quiz_format.QuizFormatRequestDto;
import com.example.quiz.model.entity.quiz_format.QuizFormatResponseDto;
import com.example.quiz.model.entity.quiz_format.QuizFormat;
import com.example.quiz.model.entity.quiz_format.QuizFormatView;
import com.example.quiz.service.quiz_format.QuizFormatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/quiz-formats")
@ResourceController("QUIZ_FORMAT")
public class QuizFormatController extends BaseController<QuizFormat, Long, QuizFormatRequestDto, QuizFormatResponseDto, QuizFormatView, QuizFormatService> {

    public QuizFormatController(QuizFormatService quizFormatService) {
        super(quizFormatService);
    }
}
