package com.example.quiz.service;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.dto.request.QuizFormatRequestDto;
import com.example.quiz.model.dto.response.QuizFormatResponseDto;
import com.example.quiz.model.entity.QuizFormat;
import com.example.quiz.model.view.QuizFormatView;

import java.util.List;

public interface QuizFormatService extends BaseService<QuizFormat, Long, QuizFormatRequestDto, QuizFormatResponseDto, QuizFormatView> {

    List<QuizFormatResponseDto> findByQuizGroupId(Long quizGroupId);

    List<QuizFormatResponseDto> findActiveByQuizGroupId(Long quizGroupId);

    QuizFormatResponseDto getQuizFormatById(Long id);

    QuizFormatResponseDto findBySlug(String slug);

    QuizFormatResponseDto create(QuizFormatRequestDto requestDto);

    QuizFormatResponseDto update(Long id, QuizFormatRequestDto requestDto);

    void deleteById(Long id);

    void softDeleteById(Long id);

    List<QuizFormatResponseDto> findByTimeLimit(Integer timeLimit);
}
