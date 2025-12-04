package com.example.quiz.repository.flashcard_category;

import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardCategoryViewRepository extends JpaRepository<FlashcardCategoryView, Long> {
    List<FlashcardCategoryView> findByUserId(Long userId);
    List<FlashcardCategoryView> findByUserIdOrderByCreatedAtDesc(Long userId);
}
