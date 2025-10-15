package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.question_option.QuestionOption;
import com.example.quiz.model.entity.question_option.QuestionOptionRequest;
import com.example.quiz.model.entity.question_option.QuestionOptionResponse;
import com.example.quiz.model.entity.question_option.QuestionOptionView;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface QuestionOptionMapper extends BaseMapstruct<QuestionOption, QuestionOptionRequest, QuestionOptionResponse, QuestionOptionView> {
}
