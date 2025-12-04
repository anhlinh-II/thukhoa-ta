package com.example.quiz.repository.flashcard_item;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.flashcard_item.FlashcardItem;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardItemRepository extends BaseRepository<FlashcardItem, Long> {
    List<FlashcardItem> findByCategoryId(Long categoryId);
    List<FlashcardItem> findByCategoryIdOrderBySortOrderAsc(Long categoryId);
    List<FlashcardItem> findByUserId(Long userId);
    int countByCategoryId(Long categoryId);
    void deleteByCategoryId(Long categoryId);
}
