package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.dto.response.QuizCategoryResponse;
import com.example.quiz.model.dto.request.QuizCategoryRequest;
import com.example.quiz.model.entity.QuizCategory;
import com.example.quiz.model.view.QuizCategoryView;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.BeanMapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface QuizCategoryMapper extends BaseMapstruct<QuizCategory, QuizCategoryRequest, QuizCategoryResponse, QuizCategoryView> {

    // Explicit method implementations to help MapStruct generate proper code
    @Override
    QuizCategory requestToEntity(QuizCategoryRequest request);

    @Override
    QuizCategoryResponse entityToResponse(QuizCategory entity);

    @Override
    QuizCategoryResponse viewToResponse(QuizCategoryView view);

    @Override
    void updateEntityFromRequest(QuizCategoryRequest request, @MappingTarget QuizCategory entity);
}
