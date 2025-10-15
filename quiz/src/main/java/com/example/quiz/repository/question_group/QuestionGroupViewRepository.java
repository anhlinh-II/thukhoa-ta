package com.example.quiz.repository.question_group;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.question_group.QuestionGroupView;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionGroupViewRepository extends BaseRepository<QuestionGroupView, Long> {
}
