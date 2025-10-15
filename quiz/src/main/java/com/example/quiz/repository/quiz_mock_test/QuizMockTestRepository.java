package com.example.quiz.repository.quiz_mock_test;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizMockTestRepository extends BaseRepository<QuizMockTest, Long> {

    Optional<QuizMockTest> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizMockTest> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);
    
    List<QuizMockTest> findByDurationMinutesAndIsDeletedFalse(Integer durationMinutes);
    
}
