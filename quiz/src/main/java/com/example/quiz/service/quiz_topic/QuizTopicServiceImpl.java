package com.example.quiz.service.quiz_topic;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.QuizTopicMapper;
import com.example.quiz.model.entity.quiz_topic.QuizTopic;
import com.example.quiz.model.entity.quiz_topic.QuizTopicRequestDto;
import com.example.quiz.model.entity.quiz_topic.QuizTopicResponseDto;
import com.example.quiz.model.entity.quiz_topic.QuizTopicView;
import com.example.quiz.repository.quiz_topic.QuizTopicRepository;
import com.example.quiz.repository.quiz_topic.QuizTopicViewRepository;
import org.springframework.stereotype.Service;

@Service
public class QuizTopicServiceImpl extends BaseServiceImpl<QuizTopic, Long, QuizTopicRequestDto, QuizTopicResponseDto, QuizTopicView> implements QuizTopicService {
    private final QuizTopicRepository questionRepository;
    private final QuizTopicViewRepository questionViewRepository;

    public QuizTopicServiceImpl(
            AdvancedFilterService advancedFilterService,
            QuizTopicRepository questionRepository,
            QuizTopicMapper questionMapper,
            QuizTopicViewRepository questionViewRepository) {
        super(advancedFilterService, questionRepository, questionMapper, questionViewRepository);
        this.questionRepository = questionRepository;
        this.questionViewRepository = questionViewRepository;
    }

    @Override
    protected Class<QuizTopicView> getViewClass() {
        return QuizTopicView.class;
    }
}

