package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.dto.request.QuizTopicRequestDto;
import com.example.quiz.model.dto.response.QuizTopicResponseDto;
import com.example.quiz.model.entity.QuizTopic;
import com.example.quiz.model.view.QuizTopicView;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface QuizTopicMapper extends BaseMapstruct<QuizTopic, QuizTopicRequestDto, QuizTopicResponseDto, QuizTopicView> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "program", ignore = true)
    @Mapping(target = "quizGroup", ignore = true)
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    QuizTopic requestToEntity(QuizTopicRequestDto request);

    @Override
    @Mapping(source = "program.id", target = "programId")
    @Mapping(source = "quizGroup.id", target = "quizGroupId")
    QuizTopicResponseDto entityToResponse(QuizTopic entity);

    @Override
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "program", ignore = true)
    @Mapping(target = "quizGroup", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(QuizTopicRequestDto request, @MappingTarget QuizTopic entity);
}
