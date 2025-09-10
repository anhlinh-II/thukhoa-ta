package com.example.quiz.service.interfaces;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.dto.request.QuizCategoryRequest;
import com.example.quiz.model.dto.response.QuizCategoryResponse;
import com.example.quiz.model.entity.QuizCategory;
import com.example.quiz.model.view.QuizCategoryView;

public interface QuizCategoryService extends BaseService<QuizCategory, Long, QuizCategoryRequest, QuizCategoryResponse, QuizCategoryView> {

    // Add any QuizCategory-specific methods here
    // For example:
    // QuizCategoryResponse findByName(String name);
    // List<QuizCategoryResponse> findActiveCategories();
    // void activateCategory(Long id);
    // void deactivateCategory(Long id);
}
