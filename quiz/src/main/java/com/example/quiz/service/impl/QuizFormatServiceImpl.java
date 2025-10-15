package com.example.quiz.service.impl;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.QuizFormatMapper;
import com.example.quiz.model.entity.quiz_format.QuizFormatRequestDto;
import com.example.quiz.model.entity.quiz_format.QuizFormatResponseDto;
import com.example.quiz.model.entity.quiz_format.QuizFormat;
import com.example.quiz.model.entity.quiz_format.QuizFormatView;
import com.example.quiz.repository.quiz_format.QuizFormatRepository;
import com.example.quiz.repository.quiz_format.QuizFormatViewRepository;
import com.example.quiz.service.quiz_format.QuizFormatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class QuizFormatServiceImpl extends BaseServiceImpl<QuizFormat, Long, QuizFormatRequestDto, QuizFormatResponseDto, QuizFormatView> implements QuizFormatService {

    private final QuizFormatRepository quizFormatRepository;
    private final QuizFormatMapper quizFormatMapper;

    public QuizFormatServiceImpl(AdvancedFilterService advancedFilterService,
                                QuizFormatRepository quizFormatRepository,
                                QuizFormatMapper quizFormatMapper,
                                QuizFormatViewRepository quizFormatViewRepository) {
        super(advancedFilterService, quizFormatRepository, quizFormatMapper, quizFormatViewRepository);
        this.quizFormatRepository = quizFormatRepository;
        this.quizFormatMapper = quizFormatMapper;
    }

    @Override
    protected Class<QuizFormatView> getViewClass() {
        return QuizFormatView.class;
    }

    @Override
    public List<QuizFormatResponseDto> findByQuizGroupId(Long quizGroupId) {
        log.info("Finding quiz formats by quiz group id: {}", quizGroupId);
        List<QuizFormat> quizFormats = quizFormatRepository.findByQuizGroupIdAndIsDeletedFalse(quizGroupId);
        return quizFormats.stream()
                .map(quizFormatMapper::entityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizFormatResponseDto> findActiveByQuizGroupId(Long quizGroupId) {
        log.info("Finding active quiz formats by quiz group id: {}", quizGroupId);
        List<QuizFormat> quizFormats = quizFormatRepository.findByQuizGroupIdAndIsActiveTrueAndIsDeletedFalse(quizGroupId);
        return quizFormats.stream()
                .map(quizFormatMapper::entityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuizFormatResponseDto getQuizFormatById(Long id) {
        log.info("Getting quiz format by id: {}", id);
        QuizFormat quizFormat = quizFormatRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_FORMAT_NOT_FOUND));
        return quizFormatMapper.entityToResponse(quizFormat);
    }

    @Override
    public QuizFormatResponseDto findBySlug(String slug) {
        log.info("Finding quiz format by slug: {}", slug);
        QuizFormat quizFormat = quizFormatRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_FORMAT_NOT_FOUND));
        return quizFormatMapper.entityToResponse(quizFormat);
    }

    @Override
    public QuizFormatResponseDto create(QuizFormatRequestDto requestDto) {
        return super.create(requestDto);
    }

    @Override
    public QuizFormatResponseDto update(Long id, QuizFormatRequestDto requestDto) {
        return super.update(id, requestDto);
    }

    @Override
    public void deleteById(Long id) {
        super.deleteById(id);
    }

    @Override
    public void softDeleteById(Long id) {
        log.info("Soft deleting quiz format with id: {}", id);
        QuizFormat quizFormat = quizFormatRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_FORMAT_NOT_FOUND));
        
        quizFormat.setIsDeleted(true);
        quizFormatRepository.save(quizFormat);
        log.info("Quiz format soft deleted successfully with id: {}", id);
    }

    @Override
    public List<QuizFormatResponseDto> findByTimeLimit(Integer timeLimit) {
        log.info("Finding quiz formats by time limit: {}", timeLimit);
        List<QuizFormat> quizFormats = quizFormatRepository.findByTimeLimitSecondsAndIsDeletedFalse(timeLimit);
        return quizFormats.stream()
                .map(quizFormatMapper::entityToResponse)
                .collect(Collectors.toList());
    }
}
