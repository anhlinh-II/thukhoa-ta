package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.dto.request.QuizFormatRequestDto;
import com.example.quiz.model.dto.response.QuizFormatResponseDto;
import com.example.quiz.model.entity.QuizFormat;
import com.example.quiz.model.view.QuizFormatView;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface QuizFormatMapper extends BaseMapstruct<QuizFormat, QuizFormatRequestDto, QuizFormatResponseDto, QuizFormatView> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "program", ignore = true)
    @Mapping(target = "quizGroup", ignore = true)
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    QuizFormat requestToEntity(QuizFormatRequestDto request);

    @Override
    @Mapping(source = "program.id", target = "programId")
    @Mapping(source = "quizGroup.id", target = "quizGroupId")
    QuizFormatResponseDto entityToResponse(QuizFormat entity);

    @Override
    QuizFormatResponseDto viewToResponse(QuizFormatView view);

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
    void updateEntityFromRequest(QuizFormatRequestDto request, @MappingTarget QuizFormat entity);
}
