package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.quiz_topic.QuizTopic;
import com.example.quiz.model.entity.quiz_topic.QuizTopicRequestDto;
import com.example.quiz.model.entity.quiz_topic.QuizTopicResponseDto;
import com.example.quiz.model.entity.quiz_topic.QuizTopicView;
import com.example.quiz.service.quiz_topic.QuizTopicService;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/quiz-topics")
@ResourceController("QUIZ_TOPIC")
@Slf4j
public class QuizTopicController extends BaseController<QuizTopic, Long, QuizTopicRequestDto, QuizTopicResponseDto, QuizTopicView, QuizTopicService> {

    private final QuizTopicService quizTopicService;

    public QuizTopicController(QuizTopicService service) {
        super(service);
        this.quizTopicService = service;
    }
}
