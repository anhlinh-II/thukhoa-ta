package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.question.Question;
import com.example.quiz.model.entity.question.QuestionRequest;
import com.example.quiz.model.entity.question.QuestionResponse;
import com.example.quiz.model.entity.question.QuestionView;
import com.example.quiz.model.entity.question_option.QuestionOption;
import com.example.quiz.model.entity.question_option.QuestionOptionRequest;
import com.example.quiz.model.entity.question_option.QuestionOptionResponse;
import com.example.quiz.model.entity.question_option.QuestionOptionView;
import com.example.quiz.service.question.QuestionService;
import com.example.quiz.service.question_option.QuestionOptionService;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/question-options")
@ResourceController("QUESTION_OPTION")
@Slf4j
public class QuestionOptionController extends BaseController<QuestionOption, Long, QuestionOptionRequest, QuestionOptionResponse, QuestionOptionView, QuestionOptionService> {
    public QuestionOptionController(QuestionOptionService questionOptionService) {
        super(questionOptionService);
    }
}
