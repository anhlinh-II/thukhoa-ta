package com.example.quiz.repository.user_question_answer;

import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswerView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserQuestionAnswerViewRepository extends JpaRepository<UserQuestionAnswerView, Long> {
}
