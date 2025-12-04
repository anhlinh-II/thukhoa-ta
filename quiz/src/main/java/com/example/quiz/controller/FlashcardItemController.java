package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.model.entity.flashcard_item.FlashcardItem;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemRequest;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemResponse;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemView;
import com.example.quiz.service.flashcard_item.FlashcardItemService;
import com.example.quiz.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/flashcard-items")
@Slf4j
public class FlashcardItemController extends BaseController<FlashcardItem, Long, FlashcardItemRequest, FlashcardItemResponse, FlashcardItemView, FlashcardItemService> {

    private final FlashcardItemService itemService;

    public FlashcardItemController(FlashcardItemService service) {
        super(service);
        this.itemService = service;
    }

    @GetMapping("/category/{categoryId}")
    public ApiResponse<List<FlashcardItemResponse>> getItemsByCategory(@PathVariable Long categoryId) {
        List<FlashcardItemResponse> items = itemService.getItemsByCategoryId(categoryId);
        return ApiResponse.successOf(items);
    }

    @GetMapping("/my-items")
    public ApiResponse<List<FlashcardItemResponse>> getMyItems() {
        Long userId = SecurityUtils.getCurrentUserId().orElse(0L);
        List<FlashcardItemResponse> items = itemService.getItemsByUserId(userId);
        return ApiResponse.successOf(items);
    }

    @PostMapping("/{id}/review")
    public ApiResponse<Map<String, Object>> reviewItem(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        boolean isCorrect = body.getOrDefault("isCorrect", false);
        itemService.reviewItem(id, isCorrect);
        return ApiResponse.successOf(Map.of("success", true));
    }
}
