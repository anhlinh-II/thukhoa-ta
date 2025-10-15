package com.example.quiz.repository.question;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.question.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QuestionRepository extends BaseRepository<Question, Long> {
}
