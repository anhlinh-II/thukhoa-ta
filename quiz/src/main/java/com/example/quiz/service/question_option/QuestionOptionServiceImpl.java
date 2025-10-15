package com.example.quiz.service.question_option;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.QuestionOptionMapper;
import com.example.quiz.model.entity.question_option.QuestionOption;
import com.example.quiz.model.entity.question_option.QuestionOptionRequest;
import com.example.quiz.model.entity.question_option.QuestionOptionResponse;
import com.example.quiz.model.entity.question_option.QuestionOptionView;
import com.example.quiz.repository.question_option.QuestionOptionRepository;
import com.example.quiz.repository.question_option.QuestionOptionViewRepository;
import org.springframework.stereotype.Service;

@Service
public class QuestionOptionServiceImpl extends BaseServiceImpl<QuestionOption, Long, QuestionOptionRequest, QuestionOptionResponse, QuestionOptionView> implements QuestionOptionService {
    private final QuestionOptionRepository questionRepository;
    private final QuestionOptionViewRepository questionViewRepository;
    private final QuestionOptionMapper questionMapper;

    public QuestionOptionServiceImpl(
            AdvancedFilterService advancedFilterService,
            QuestionOptionRepository questionRepository,
            QuestionOptionMapper questionMapper,
            QuestionOptionViewRepository questionViewRepository) {
        super(advancedFilterService, questionRepository, questionMapper, questionViewRepository);
        this.questionRepository = questionRepository;
        this.questionViewRepository = questionViewRepository;
        this.questionMapper = questionMapper;
    }

    @Override
    protected Class<QuestionOptionView> getViewClass() {
        return QuestionOptionView.class;
    }
}
