package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisRequestDto;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisResponseDto;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisView;
import com.example.quiz.service.user_quiz_history.UserQuizMockHisBaseService;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me/quiz-history")
@ResourceController("USER_QUIZ_HISTORY")
@Slf4j
public class UserQuizMockHisController extends BaseController<UserQuizMockHis, Long, UserQuizMockHisRequestDto, UserQuizMockHisResponseDto, UserQuizMockHisView, UserQuizMockHisBaseService> {

    public UserQuizMockHisController(UserQuizMockHisBaseService service) {
        super(service);
    }
}
