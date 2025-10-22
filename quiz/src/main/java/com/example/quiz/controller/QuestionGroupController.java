package com.example.quiz.controller;

import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.entity.question_group.QuestionGroup;
import com.example.quiz.model.entity.question_group.QuestionGroupRequest;
import com.example.quiz.model.entity.question_group.QuestionGroupResponse;
import com.example.quiz.model.entity.question_group.QuestionGroupView;
import com.example.quiz.service.question_group.QuestionGroupService;
import com.example.quiz.validators.requirePermission.ResourceController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/question-groups")
@ResourceController("QUESTION_GROUP")
@Slf4j
public class QuestionGroupController extends BaseController<QuestionGroup, Long, QuestionGroupRequest, QuestionGroupResponse, QuestionGroupView, QuestionGroupService> {
    public QuestionGroupController(QuestionGroupService questionGroupService) {
        super(questionGroupService);
    }
}
