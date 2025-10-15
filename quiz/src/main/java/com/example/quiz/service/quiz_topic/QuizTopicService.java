package com.example.quiz.service.quiz_topic;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.quiz_topic.QuizTopicRequestDto;
import com.example.quiz.model.entity.quiz_topic.QuizTopicResponseDto;
import com.example.quiz.model.entity.quiz_topic.QuizTopic;
import com.example.quiz.model.entity.quiz_topic.QuizTopicView;

import java.util.List;

public interface QuizTopicService extends BaseService<QuizTopic, Long, QuizTopicRequestDto, QuizTopicResponseDto, QuizTopicView> {
}

