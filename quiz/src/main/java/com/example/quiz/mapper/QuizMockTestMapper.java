package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestRequestDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestResponseDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestView;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface QuizMockTestMapper extends BaseMapstruct<QuizMockTest, QuizMockTestRequestDto, QuizMockTestResponseDto, QuizMockTestView> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quizGroup", ignore = true)
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    QuizMockTest requestToEntity(QuizMockTestRequestDto request);

    @Override
    @Mapping(source = "quizGroup.id", target = "quizGroup")
    QuizMockTestResponseDto entityToResponse(QuizMockTest entity);

    @Override
    QuizMockTestResponseDto viewToResponse(QuizMockTestView view);

    @Override
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "quizGroup", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(QuizMockTestRequestDto request, @MappingTarget QuizMockTest entity);
}
