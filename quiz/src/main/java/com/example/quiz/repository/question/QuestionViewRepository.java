package com.example.quiz.repository.question;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.question.QuestionView;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionViewRepository extends BaseRepository<QuestionView, Long> {
}
