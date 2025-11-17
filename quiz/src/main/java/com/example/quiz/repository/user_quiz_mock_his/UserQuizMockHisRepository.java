package com.example.quiz.repository.user_quiz_mock_his;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import org.springframework.stereotype.Repository;

@Repository
public interface UserQuizMockHisRepository extends BaseRepository<UserQuizMockHis, Long> {
	org.springframework.data.domain.Page<UserQuizMockHis> findAllByUserIdOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);

	org.springframework.data.domain.Page<UserQuizMockHis> findAllByUserIdAndQuizTypeOrderByCreatedAtDesc(Long userId, com.example.quiz.enums.GroupType quizType, org.springframework.data.domain.Pageable pageable);
}
