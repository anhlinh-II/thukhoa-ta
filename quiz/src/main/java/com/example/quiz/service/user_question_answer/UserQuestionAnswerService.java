package com.example.quiz.service.user_question_answer;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswer;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerRequest;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerView;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerResponse;

public interface UserQuestionAnswerService extends BaseService<UserQuestionAnswer, Long, UserQuestionAnswerRequest, UserQuestionAnswerResponse, UserQuestionAnswerView> {
}
