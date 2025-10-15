package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.question.Question;
import com.example.quiz.model.entity.question.QuestionRequest;
import com.example.quiz.model.entity.question.QuestionResponse;
import com.example.quiz.model.entity.question.QuestionView;
import com.example.quiz.service.question.QuestionService;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/questions")
@ResourceController("QUESTION")
@Slf4j
public class QuestionController extends BaseController<Question, Long, QuestionRequest, QuestionResponse, QuestionView, QuestionService> {
}
