package com.example.quiz.service.question_group;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.QuestionGroupMapper;
import com.example.quiz.model.entity.question_group.QuestionGroup;
import com.example.quiz.model.entity.question_group.QuestionGroupRequest;
import com.example.quiz.model.entity.question_group.QuestionGroupResponse;
import com.example.quiz.model.entity.question_group.QuestionGroupView;
import com.example.quiz.repository.question_group.QuestionGroupRepository;
import com.example.quiz.repository.question_group.QuestionGroupViewRepository;
import org.springframework.stereotype.Service;

@Service
public class QuestionGroupServiceImpl extends BaseServiceImpl<QuestionGroup, Long, QuestionGroupRequest, QuestionGroupResponse, QuestionGroupView> implements QuestionGroupService {
    private final QuestionGroupRepository questionRepository;
    private final QuestionGroupViewRepository questionViewRepository;

    public QuestionGroupServiceImpl(
            AdvancedFilterService advancedFilterService,
            QuestionGroupRepository questionRepository,
            QuestionGroupMapper questionMapper,
            QuestionGroupViewRepository questionViewRepository) {
        super(advancedFilterService, questionRepository, questionMapper, questionViewRepository);
        this.questionRepository = questionRepository;
        this.questionViewRepository = questionViewRepository;
    }

    @Override
    protected Class<QuestionGroupView> getViewClass() {
        return QuestionGroupView.class;
    }
}
