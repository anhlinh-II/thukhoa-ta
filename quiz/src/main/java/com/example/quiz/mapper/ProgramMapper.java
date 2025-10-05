package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.dto.request.ProgramRequestDto;
import com.example.quiz.model.dto.response.ProgramResponseDto;
import com.example.quiz.model.entity.Program;
import com.example.quiz.model.view.ProgramView;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProgramMapper extends BaseMapstruct<Program, ProgramRequestDto, ProgramResponseDto, ProgramView> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "parent", ignore = true) // Will be set manually in service
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "quizzes", ignore = true)
    Program requestToEntity(ProgramRequestDto request);

    @Override
    @Mapping(target = "parentId", source = "parent.id")
    @Mapping(target = "parentName", source = "parent.name")
    @Mapping(target = "levelName", expression = "java(getLevelName(entity.getLevel()))")
    @Mapping(target = "childrenCount", expression = "java(getChildrenCount(entity))")
    @Mapping(target = "quizCount", expression = "java(getQuizCount(entity))")
    @Mapping(target = "isLeaf", expression = "java(entity.isLeaf())")
    @Mapping(target = "isRoot", expression = "java(entity.isRoot())")
    @Mapping(target = "depth", expression = "java(entity.getDepth())")
    @Mapping(target = "path", ignore = true) // Will be calculated if needed
    @Mapping(target = "children", ignore = true) // Avoid infinite recursion
    ProgramResponseDto entityToResponse(Program entity);

    @Override
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "children", ignore = true)
    @Mapping(target = "quizzes", ignore = true)
    void updateEntityFromRequest(ProgramRequestDto request, @MappingTarget Program entity);

    @Override
    @Mapping(target = "parentId", source = "parentId")
    @Mapping(target = "isRoot", expression = "java(view.getParentId() == null)")
    @Mapping(target = "depth", source = "depth")
    @Mapping(target = "path", source = "path")
    @Mapping(target = "children", ignore = true)
    ProgramResponseDto viewToResponse(ProgramView view);

    // Helper methods
    default String getLevelName(Integer level) {
        if (level == null) return null;
        return switch (level) {
            case 1 -> "Beginner";
            case 2 -> "Intermediate";
            case 3 -> "Advanced";
            default -> "Unknown";
        };
    }

    default Integer getChildrenCount(Program entity) {
        return entity.getChildren() == null ? 0 : entity.getChildren().size();
    }

    default Integer getQuizCount(Program entity) {
        return entity.getQuizzes() == null ? 0 : entity.getQuizzes().size();
    }
}
