package com.example.quiz.service;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.dto.request.QuizMockTestRequestDto;
import com.example.quiz.model.dto.response.QuizMockTestResponseDto;
import com.example.quiz.model.entity.QuizMockTest;
import com.example.quiz.model.view.QuizMockTestView;

import java.util.List;

public interface QuizMockTestService extends BaseService<QuizMockTest, Long, QuizMockTestRequestDto, QuizMockTestResponseDto, QuizMockTestView> {

    List<QuizMockTestResponseDto> findByQuizGroupId(Long quizGroupId);

    List<QuizMockTestResponseDto> findActiveByQuizGroupId(Long quizGroupId);

    QuizMockTestResponseDto getQuizMockTestById(Long id);

    QuizMockTestResponseDto findBySlug(String slug);

    QuizMockTestResponseDto create(QuizMockTestRequestDto requestDto);

    QuizMockTestResponseDto update(Long id, QuizMockTestRequestDto requestDto);

    void deleteById(Long id);

    void softDeleteById(Long id);

    List<QuizMockTestResponseDto> findByTimeLimit(Integer timeLimit);

    Long countByQuizGroupId(Long quizGroupId);
}
