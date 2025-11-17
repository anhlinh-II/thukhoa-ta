package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswer;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerRequest;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerResponse;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerView;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserQuestionAnswerMapper extends BaseMapstruct<UserQuestionAnswer, UserQuestionAnswerRequest, UserQuestionAnswerResponse, UserQuestionAnswerView> {
}