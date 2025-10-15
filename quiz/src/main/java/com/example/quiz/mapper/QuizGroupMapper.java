package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.quiz_group.QuizGroupRequestDto;
import com.example.quiz.model.entity.quiz_group.QuizGroupResponseDto;
import com.example.quiz.model.entity.quiz_group.QuizGroup;
import com.example.quiz.model.entity.quiz_group.QuizGroupView;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface QuizGroupMapper extends BaseMapstruct<QuizGroup, QuizGroupRequestDto, QuizGroupResponseDto, QuizGroupView> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "program", ignore = true)
    @Mapping(target = "isDeleted", constant = "false")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    QuizGroup requestToEntity(QuizGroupRequestDto request);

    @Override
    @Mapping(source = "program.id", target = "programId")
    QuizGroupResponseDto entityToResponse(QuizGroup entity);

    @Override
    QuizGroupResponseDto viewToResponse(QuizGroupView view);

    @Override
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "program", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(QuizGroupRequestDto request, @MappingTarget QuizGroup entity);
}
