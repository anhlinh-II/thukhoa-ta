package com.example.quiz.repository.flashcard_item;

import com.example.quiz.model.entity.flashcard_item.FlashcardItemView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardItemViewRepository extends JpaRepository<FlashcardItemView, Long> {
    List<FlashcardItemView> findByCategoryId(Long categoryId);
    List<FlashcardItemView> findByCategoryIdOrderBySortOrderAsc(Long categoryId);
    List<FlashcardItemView> findByUserId(Long userId);
}
