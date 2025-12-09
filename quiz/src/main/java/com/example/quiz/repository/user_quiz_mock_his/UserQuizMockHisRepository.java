package com.example.quiz.repository.user_quiz_mock_his;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserQuizMockHisRepository extends BaseRepository<UserQuizMockHis, Long> {
	org.springframework.data.domain.Page<UserQuizMockHis> findAllByUserIdOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);

	org.springframework.data.domain.Page<UserQuizMockHis> findAllByUserIdAndQuizTypeOrderByCreatedAtDesc(Long userId, com.example.quiz.enums.GroupType quizType, org.springframework.data.domain.Pageable pageable);

	List<UserQuizMockHis> findAllByUserId(Long userId);

	@Query("SELECT COALESCE(SUM(h.timeSpent), 0) FROM UserQuizMockHis h WHERE h.userId = :userId")
	Integer getTotalStudyTimeByUserId(@Param("userId") Long userId);

	@Query("SELECT COALESCE(AVG(h.score), 0) FROM UserQuizMockHis h WHERE h.userId = :userId")
	Double getAverageScoreByUserId(@Param("userId") Long userId);

	@Query("SELECT COUNT(h) FROM UserQuizMockHis h WHERE h.userId = :userId")
	Integer countByUserId(@Param("userId") Long userId);
}
