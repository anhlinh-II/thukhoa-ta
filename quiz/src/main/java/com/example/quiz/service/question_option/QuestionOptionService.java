package com.example.quiz.service.question_option;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.question_option.QuestionOption;
import com.example.quiz.model.entity.question_option.QuestionOptionRequest;
import com.example.quiz.model.entity.question_option.QuestionOptionResponse;
import com.example.quiz.model.entity.question_option.QuestionOptionView;

public interface QuestionOptionService extends BaseService<QuestionOption, Long, QuestionOptionRequest, QuestionOptionResponse, QuestionOptionView> {
}
