package com.example.quiz.repository.quiz_mock_test;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestView;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuizMockTestViewRepository extends BaseRepository<QuizMockTestView, Long> {

    Optional<QuizMockTestView> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizMockTestView> findBySlugAndIsDeletedFalse(String slug);
}
