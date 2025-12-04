package com.example.quiz.service.flashcard_item;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.flashcard_item.FlashcardItem;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemRequest;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemResponse;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemView;

import java.util.List;

public interface FlashcardItemService extends BaseService<FlashcardItem, Long, FlashcardItemRequest, FlashcardItemResponse, FlashcardItemView> {
    List<FlashcardItemResponse> getItemsByCategoryId(Long categoryId);
    List<FlashcardItemResponse> getItemsByUserId(Long userId);
    void reviewItem(Long itemId, boolean isCorrect);
}
