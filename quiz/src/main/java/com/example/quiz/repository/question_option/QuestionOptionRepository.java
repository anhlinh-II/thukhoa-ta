package com.example.quiz.repository.question_option;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.question_option.QuestionOption;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionOptionRepository extends BaseRepository<QuestionOption, Long> {
}
