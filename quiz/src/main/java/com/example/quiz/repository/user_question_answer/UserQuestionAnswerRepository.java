package com.example.quiz.repository.user_question_answer;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswer;
import org.springframework.stereotype.Repository;

@Repository
public interface UserQuestionAnswerRepository extends BaseRepository<UserQuestionAnswer, Long> {
	java.util.List<UserQuestionAnswer> findAllByQuizHisId(Long quizHisId);
}
