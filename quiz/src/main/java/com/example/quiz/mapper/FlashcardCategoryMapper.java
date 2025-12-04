package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategory;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryRequest;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryResponse;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryView;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FlashcardCategoryMapper extends BaseMapstruct<FlashcardCategory, FlashcardCategoryRequest, FlashcardCategoryResponse, FlashcardCategoryView> {
}
