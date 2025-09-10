package com.example.quiz.service.impl;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.QuizMockTestMapper;
import com.example.quiz.model.dto.request.QuizMockTestRequestDto;
import com.example.quiz.model.dto.response.QuizMockTestResponseDto;
import com.example.quiz.model.entity.QuizMockTest;
import com.example.quiz.model.view.QuizMockTestView;
import com.example.quiz.repository.QuizMockTestRepository;
import com.example.quiz.repository.QuizMockTestViewRepository;
import com.example.quiz.service.QuizMockTestService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

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

    @Override
    public List<QuizMockTestResponseDto> findByQuizGroupId(Long quizGroupId) {
        log.info("Finding quiz mock tests by quiz group id: {}", quizGroupId);
        List<QuizMockTest> quizMockTests = quizMockTestRepository.findByQuizGroupIdAndIsDeletedFalse(quizGroupId);
        return quizMockTests.stream()
                .map(quizMockTestMapper::entityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<QuizMockTestResponseDto> findActiveByQuizGroupId(Long quizGroupId) {
        log.info("Finding active quiz mock tests by quiz group id: {}", quizGroupId);
        List<QuizMockTest> quizMockTests = quizMockTestRepository.findByQuizGroupIdAndIsActiveTrueAndIsDeletedFalse(quizGroupId);
        return quizMockTests.stream()
                .map(quizMockTestMapper::entityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuizMockTestResponseDto getQuizMockTestById(Long id) {
        log.info("Getting quiz mock test by id: {}", id);
        QuizMockTest quizMockTest = quizMockTestRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_MOCK_TEST_NOT_FOUND));
        return quizMockTestMapper.entityToResponse(quizMockTest);
    }

    @Override
    public QuizMockTestResponseDto findBySlug(String slug) {
        log.info("Finding quiz mock test by slug: {}", slug);
        QuizMockTest quizMockTest = quizMockTestRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_MOCK_TEST_NOT_FOUND));
        return quizMockTestMapper.entityToResponse(quizMockTest);
    }

    @Override
    public QuizMockTestResponseDto create(QuizMockTestRequestDto requestDto) {
        return super.create(requestDto);
    }

    @Override
    public QuizMockTestResponseDto update(Long id, QuizMockTestRequestDto requestDto) {
        return super.update(id, requestDto);
    }

    @Override
    public void deleteById(Long id) {
        super.deleteById(id);
    }

    @Override
    public void softDeleteById(Long id) {
        log.info("Soft deleting quiz mock test with id: {}", id);
        QuizMockTest quizMockTest = quizMockTestRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_MOCK_TEST_NOT_FOUND));
        
        quizMockTest.setIsDeleted(true);
        quizMockTestRepository.save(quizMockTest);
        log.info("Quiz mock test soft deleted successfully with id: {}", id);
    }

    @Override
    public List<QuizMockTestResponseDto> findByTimeLimit(Integer timeLimit) {
        log.info("Finding quiz mock tests by time limit: {}", timeLimit);
        List<QuizMockTest> quizMockTests = quizMockTestRepository.findByDurationMinutesAndIsDeletedFalse(timeLimit);
        return quizMockTests.stream()
                .map(quizMockTestMapper::entityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Long countByQuizGroupId(Long quizGroupId) {
        log.info("Counting quiz mock tests by quiz group id: {}", quizGroupId);
        return quizMockTestRepository.countByQuizGroupId(quizGroupId);
    }
}
