package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.user_learning_item.UserLearningItem;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemRequest;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemResponse;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemView;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserLearningItemMapper extends BaseMapstruct<UserLearningItem, UserLearningItemRequest, UserLearningItemResponse, UserLearningItemView> {
}
