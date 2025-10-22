package com.example.quiz.service.impl;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.enums.QuizType;
import com.example.quiz.mapper.QuizMockTestMapper;
import com.example.quiz.model.entity.question.QuestionRequest;
import com.example.quiz.model.entity.question.QuestionResponse;
import com.example.quiz.model.entity.question_group.QuestionGroupRequest;
import com.example.quiz.model.entity.question_group.QuestionGroupResponse;
import com.example.quiz.model.entity.question_option.QuestionOptionRequest;
import com.example.quiz.model.entity.question_option.QuestionOptionResponse;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestRequestDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestResponseDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestView;
import com.example.quiz.repository.quiz_mock_test.QuizMockTestRepository;
import com.example.quiz.repository.quiz_mock_test.QuizMockTestViewRepository;
import com.example.quiz.service.question.QuestionService;
import com.example.quiz.service.question_group.QuestionGroupService;
import com.example.quiz.service.question_option.QuestionOptionService;
import com.example.quiz.service.quiz_mock_test.QuizMockTestService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class QuizMockTestServiceImpl extends BaseServiceImpl<QuizMockTest, Long, QuizMockTestRequestDto, QuizMockTestResponseDto, QuizMockTestView> implements QuizMockTestService {

    private final QuizMockTestRepository quizMockTestRepository;
    private final QuizMockTestMapper quizMockTestMapper;
    private final QuestionGroupService questionGroupService;
    private final QuestionService questionService;
    private final QuestionOptionService questionOptionService;

    public QuizMockTestServiceImpl(AdvancedFilterService advancedFilterService,
                                   QuizMockTestRepository quizMockTestRepository,
                                   QuizMockTestMapper quizMockTestMapper,
                                   QuizMockTestViewRepository quizMockTestViewRepository,
                                   QuestionGroupService questionGroupService,
                                   QuestionService questionService,
                                   QuestionOptionService questionOptionService) {
        super(advancedFilterService, quizMockTestRepository, quizMockTestMapper, quizMockTestViewRepository);
        this.quizMockTestRepository = quizMockTestRepository;
        this.quizMockTestMapper = quizMockTestMapper;
        this.questionGroupService = questionGroupService;
        this.questionService = questionService;
        this.questionOptionService = questionOptionService;
    }

    @Override
    protected Class<QuizMockTestView> getViewClass() {
        return QuizMockTestView.class;
    }

    @Override
    public void afterCreate(QuizMockTest entity, QuizMockTestResponseDto response, QuizMockTestRequestDto request) {
        log.info("Creating nested questions for quiz mock test id: {}", entity.getId());
        
        // Create question groups with their questions
        if (request.getQuestionGroups() != null && !request.getQuestionGroups().isEmpty()) {
            for (QuizMockTestRequestDto.QuestionGroupWithQuestionsDto groupDto : request.getQuestionGroups()) {
                // Use service to create question group
                QuestionGroupResponse group = questionGroupService.create(groupDto.getGroup());
                
                if (groupDto.getQuestions() != null) {
                    for (QuizMockTestRequestDto.QuestionWithOptionsDto qDto : groupDto.getQuestions()) {
                        // Set quizId and groupId before creating question
                        QuestionRequest questionRequest = qDto.getQuestion();
                        questionRequest.setQuizId(entity.getId());
                        questionRequest.setQuizType(QuizType.QUIZ_MOCK_TEST);
                        questionRequest.setGroupId(group.getId());
                        
                        // Use service to create question
                        QuestionResponse question = questionService.create(questionRequest);
                        
                        // Create options for this question
                        if (qDto.getOptions() != null && !qDto.getOptions().isEmpty()) {
                            for (QuestionOptionRequest optReq : qDto.getOptions()) {
                                optReq.setQuestionId(question.getId());
                                // Use service to create question option
                                questionOptionService.create(optReq);
                            }
                        }
                    }
                }
            }
        }
        
        // Create standalone questions
        if (request.getStandaloneQuestions() != null && !request.getStandaloneQuestions().isEmpty()) {
            for (QuizMockTestRequestDto.QuestionWithOptionsDto qDto : request.getStandaloneQuestions()) {
                // Set quizId before creating question
                QuestionRequest questionRequest = qDto.getQuestion();
                questionRequest.setQuizId(entity.getId());
                questionRequest.setQuizType(QuizType.QUIZ_MOCK_TEST);
                if (questionRequest.getGroupId() == null) {
                    questionRequest.setGroupId(0L);
                }
                
                // Use service to create question
                QuestionResponse question = questionService.create(questionRequest);
                
                // Create options for this question
                if (qDto.getOptions() != null && !qDto.getOptions().isEmpty()) {
                    for (QuestionOptionRequest optReq : qDto.getOptions()) {
                        optReq.setQuestionId(question.getId());
                        // Use service to create question option
                        questionOptionService.create(optReq);
                    }
                }
            }
        }
        
        log.info("Finished creating nested questions for quiz mock test id: {}", entity.getId());
    }

    @Override
    public Map<String, Object> getQuizPreview(Long quizId) {
        log.info("Building preview for quiz mock test id: {}", quizId);
        
        // Get quiz using base service method
        QuizMockTestResponseDto quiz = this.getById(quizId);
        
        // Get all questions for this quiz using service findAll
        List<QuestionResponse> allQuestions = questionService.findAll();
        
        // Filter questions by quizId and sort
        List<QuestionResponse> questions = allQuestions.stream()
                .filter(q -> q.getQuizId() != null && q.getQuizId().equals(quizId))
                .sorted(Comparator.comparingLong((QuestionResponse q) -> q.getGroupId() != null ? q.getGroupId() : 0L).thenComparingInt(QuestionResponse::getOrderIndex))
                .toList();
        
        // Group questions by groupId
        Map<Long, List<QuestionResponse>> questionsByGroup = new java.util.HashMap<>();
        List<QuestionResponse> standaloneQuestions = new java.util.ArrayList<>();
        
        for (QuestionResponse q : questions) {
            if (q.getGroupId() != null && q.getGroupId() > 0) {
                questionsByGroup.computeIfAbsent(q.getGroupId(), k -> new java.util.ArrayList<>()).add(q);
            } else {
                standaloneQuestions.add(q);
            }
        }
        
        // Build response with groups and their questions
        List<Map<String, Object>> groups = new java.util.ArrayList<>();
        for (Map.Entry<Long, List<QuestionResponse>> entry : questionsByGroup.entrySet()) {
            try {
                // Use service to get group
                QuestionGroupResponse group = questionGroupService.getById(entry.getKey());
                
                Map<String, Object> groupData = new java.util.HashMap<>();
                groupData.put("id", group.getId());
                groupData.put("title", group.getTitle());
                groupData.put("contentHtml", group.getContentHtml());
                groupData.put("mediaUrl", group.getMediaUrl());
                
                List<Map<String, Object>> groupQuestions = new java.util.ArrayList<>();
                for (QuestionResponse q : entry.getValue()) {
                    groupQuestions.add(buildQuestionWithOptions(q));
                }
                groupData.put("questions", groupQuestions);
                groups.add(groupData);
            } catch (Exception e) {
                log.warn("Failed to load group {}: {}", entry.getKey(), e.getMessage());
            }
        }
        
        // Build standalone questions
        List<Map<String, Object>> standalone = new java.util.ArrayList<>();
        for (QuestionResponse q : standaloneQuestions) {
            standalone.add(buildQuestionWithOptions(q));
        }
        
        Map<String, Object> result = new java.util.HashMap<>();
        result.put("quiz", quiz);
        result.put("questionGroups", groups);
        result.put("standaloneQuestions", standalone);
        result.put("totalQuestions", questions.size());
        
        return result;
    }
    
    private Map<String, Object> buildQuestionWithOptions(QuestionResponse question) {
        Map<String, Object> qData = new java.util.HashMap<>();
        qData.put("id", question.getId());
        qData.put("type", question.getType());
        qData.put("contentHtml", question.getContentHtml());
        qData.put("explanationHtml", question.getExplanationHtml());
        qData.put("score", question.getScore());
        qData.put("orderIndex", question.getOrderIndex());
        
        // Get all options and filter by questionId
        List<QuestionOptionResponse> allOptions = questionOptionService.findAll();
        List<QuestionOptionResponse> options = allOptions.stream()
                .filter(opt -> opt.getQuestionId() != null && opt.getQuestionId().equals(question.getId()))
                .sorted((o1, o2) -> Integer.compare(o1.getOrderIndex(), o2.getOrderIndex()))
                .collect(Collectors.toList());
        
        qData.put("options", options);
        
        return qData;
    }
}
