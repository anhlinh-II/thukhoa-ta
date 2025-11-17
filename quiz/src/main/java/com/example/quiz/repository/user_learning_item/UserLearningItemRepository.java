package com.example.quiz.repository.user_learning_item;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.user_learning_item.UserLearningItem;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import com.example.quiz.enums.LearningType;

@Repository
public interface UserLearningItemRepository extends BaseRepository<UserLearningItem, Long> {
	Optional<UserLearningItem> findByUserIdAndQuestionId(Long userId, Long questionId);

	List<UserLearningItem> findAllByUserIdAndNextReviewAtBefore(Long userId, Instant time);

	Optional<UserLearningItem> findByUserIdAndQuestionIdAndLearningType(Long userId, Long questionId, LearningType learningType);

	List<UserLearningItem> findAllByUserIdAndLearningTypeAndNextReviewAtBefore(Long userId, LearningType learningType, Instant time);
}
