package com.example.quiz.repository.flashcard_category;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategory;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FlashcardCategoryRepository extends BaseRepository<FlashcardCategory, Long> {
    List<FlashcardCategory> findByUserId(Long userId);
    List<FlashcardCategory> findByUserIdOrderByCreatedAtDesc(Long userId);
    boolean existsByUserIdAndName(Long userId, String name);
}
