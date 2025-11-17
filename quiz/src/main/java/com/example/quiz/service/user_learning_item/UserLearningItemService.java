package com.example.quiz.service.user_learning_item;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.user_learning_item.UserLearningItem;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemRequest;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemResponse;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemView;
import com.example.quiz.enums.LearningType;

import java.util.List;


public interface UserLearningItemService extends BaseService<UserLearningItem, Long, UserLearningItemRequest, UserLearningItemResponse, UserLearningItemView> {
	List<UserLearningItemResponse> getDueItems(Long userId, LearningType learningType);
	UserLearningItemResponse updateReview(Long id, int quality);
}
