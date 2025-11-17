package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswer;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerRequest;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerResponse;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerView;
import com.example.quiz.service.user_question_answer.UserQuestionAnswerService;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user-question-answers")
@ResourceController("USER_QUESTION_ANSWER")
@Slf4j
public class UserQuestionAnswerController extends BaseController<UserQuestionAnswer, Long, UserQuestionAnswerRequest, UserQuestionAnswerResponse, UserQuestionAnswerView, UserQuestionAnswerService> {
    public UserQuestionAnswerController(UserQuestionAnswerService service) {
        super(service);
    }
}

