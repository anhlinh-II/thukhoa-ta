package com.example.quiz.service.question;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.QuestionMapper;
import com.example.quiz.model.entity.question.Question;
import com.example.quiz.model.entity.question.QuestionRequest;
import com.example.quiz.model.entity.question.QuestionResponse;
import com.example.quiz.model.entity.question.QuestionView;
import com.example.quiz.repository.question.QuestionRepository;
import com.example.quiz.repository.question.QuestionViewRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@Transactional
public class QuestionServiceImpl extends BaseServiceImpl<Question, Long, QuestionRequest, QuestionResponse, QuestionView> implements QuestionService {
    private final QuestionRepository questionRepository;
    private final QuestionViewRepository questionViewRepository;
    private final QuestionMapper questionMapper;

    public QuestionServiceImpl(
            AdvancedFilterService advancedFilterService,
            QuestionRepository questionRepository,
            QuestionMapper questionMapper,
            QuestionViewRepository questionViewRepository) {
        super(advancedFilterService, questionRepository, questionMapper, questionViewRepository);
        this.questionRepository = questionRepository;
        this.questionViewRepository = questionViewRepository;
        this.questionMapper = questionMapper;
    }

    @Override
    protected Class<QuestionView> getViewClass() {
        return QuestionView.class;
    }
}
