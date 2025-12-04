package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategory;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryRequest;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryResponse;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryView;
import com.example.quiz.service.flashcard_category.FlashcardCategoryService;
import com.example.quiz.utils.SecurityUtils;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flashcard-categories")
@Slf4j
@ResourceController("FLASHCARD_CATEGORY")
public class FlashcardCategoryController extends BaseController<FlashcardCategory, Long, FlashcardCategoryRequest, FlashcardCategoryResponse, FlashcardCategoryView, FlashcardCategoryService> {

    private final FlashcardCategoryService categoryService;

    public FlashcardCategoryController(FlashcardCategoryService service) {
        super(service);
        this.categoryService = service;
    }

    @GetMapping("/my-categories")
    public ApiResponse<List<FlashcardCategoryResponse>> getMyCategories() {
        Long userId = SecurityUtils.getCurrentUserId().orElse(0L);
        List<FlashcardCategoryResponse> categories = categoryService.getCategoriesByUserId(userId);
        return ApiResponse.successOf(categories);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<FlashcardCategoryResponse>> getCategoriesByUser(@PathVariable Long userId) {
        List<FlashcardCategoryResponse> categories = categoryService.getCategoriesByUserId(userId);
        return ApiResponse.successOf(categories);
    }
}
