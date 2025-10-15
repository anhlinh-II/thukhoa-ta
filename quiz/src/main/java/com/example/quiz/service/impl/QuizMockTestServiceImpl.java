package com.example.quiz.service.impl;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.QuizMockTestMapper;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestRequestDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestResponseDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestView;
import com.example.quiz.repository.quiz_mock_test.QuizMockTestRepository;
import com.example.quiz.repository.quiz_mock_test.QuizMockTestViewRepository;
import com.example.quiz.service.quiz_mock_test.QuizMockTestService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional
public class QuizMockTestServiceImpl extends BaseServiceImpl<QuizMockTest, Long, QuizMockTestRequestDto, QuizMockTestResponseDto, QuizMockTestView> implements QuizMockTestService {

    private final QuizMockTestRepository quizMockTestRepository;
    private final QuizMockTestMapper quizMockTestMapper;

    public QuizMockTestServiceImpl(AdvancedFilterService advancedFilterService,
                                   QuizMockTestRepository quizMockTestRepository,
                                   QuizMockTestMapper quizMockTestMapper,
                                   QuizMockTestViewRepository quizMockTestViewRepository) {
        super(advancedFilterService, quizMockTestRepository, quizMockTestMapper, quizMockTestViewRepository);
        this.quizMockTestRepository = quizMockTestRepository;
        this.quizMockTestMapper = quizMockTestMapper;
    }

    @Override
    protected Class<QuizMockTestView> getViewClass() {
        return QuizMockTestView.class;
    }

}
