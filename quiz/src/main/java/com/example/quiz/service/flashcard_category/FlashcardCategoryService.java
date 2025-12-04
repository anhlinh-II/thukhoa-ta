package com.example.quiz.service.flashcard_category;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategory;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryRequest;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryResponse;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryView;

import java.util.List;

public interface FlashcardCategoryService extends BaseService<FlashcardCategory, Long, FlashcardCategoryRequest, FlashcardCategoryResponse, FlashcardCategoryView> {
    List<FlashcardCategoryResponse> getCategoriesByUserId(Long userId);
}
