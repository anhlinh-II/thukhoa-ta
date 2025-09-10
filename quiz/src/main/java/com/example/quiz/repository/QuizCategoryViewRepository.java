package com.example.quiz.repository;

import com.example.quiz.model.view.QuizCategoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizCategoryViewRepository extends JpaRepository<QuizCategoryView, Long> {
}
