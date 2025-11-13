package com.example.quiz.repository.user_quiz_mock_his;

import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHisView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserQuizMockHisViewRepository extends JpaRepository<UserQuizMockHisView, Long> {
}
