package com.example.quiz.service.question_group;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.question_group.QuestionGroup;
import com.example.quiz.model.entity.question_group.QuestionGroupRequest;
import com.example.quiz.model.entity.question_group.QuestionGroupResponse;
import com.example.quiz.model.entity.question_group.QuestionGroupView;

public interface QuestionGroupService extends BaseService<QuestionGroup, Long, QuestionGroupRequest, QuestionGroupResponse, QuestionGroupView> {
}
