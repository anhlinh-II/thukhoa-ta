package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisRequestDto;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisResponseDto;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisView;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserQuizMockHisMapper extends BaseMapstruct<UserQuizMockHis, UserQuizMockHisRequestDto, UserQuizMockHisResponseDto, UserQuizMockHisView> {
}
