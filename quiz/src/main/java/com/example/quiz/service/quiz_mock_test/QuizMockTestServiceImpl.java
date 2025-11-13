package com.example.quiz.service.quiz_mock_test;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.enums.QuizType;
import com.example.quiz.mapper.QuizMockTestMapper;
import com.example.quiz.model.dto.request.SubmitQuizRequest;
import com.example.quiz.model.dto.response.SubmitQuizResponse;
import com.example.quiz.model.entity.question.QuestionRequest;
import com.example.quiz.model.entity.question.QuestionResponse;
import com.example.quiz.model.entity.question_group.QuestionGroupResponse;
import com.example.quiz.model.entity.question_option.QuestionOptionRequest;
import com.example.quiz.model.entity.question_option.QuestionOptionResponse;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestRequestDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestResponseDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestView;
import com.example.quiz.repository.quiz_mock_test.QuizMockTestRepository;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import com.example.quiz.model.entity.user_ques_wrong.UserQuesWrong;
import com.example.quiz.repository.user_quiz_mock_his.UserQuizMockHisRepository;
import com.example.quiz.repository.user_ques_wrong.UserQuesWrongRepository;
import com.example.quiz.repository.quiz_mock_test.QuizMockTestViewRepository;
import com.example.quiz.service.interfaces.UserService;
import com.example.quiz.service.question.QuestionService;
import com.example.quiz.service.question_group.QuestionGroupService;
import com.example.quiz.service.question_option.QuestionOptionService;
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
    private final UserQuizMockHisRepository userQuizMockHisRepository;
    private final UserQuesWrongRepository userQuesWrongRepository;
    private final UserService userService;

    public QuizMockTestServiceImpl(AdvancedFilterService advancedFilterService,
                                   QuizMockTestRepository quizMockTestRepository,
                                   QuizMockTestMapper quizMockTestMapper,
                                   QuizMockTestViewRepository quizMockTestViewRepository,
                                   QuestionGroupService questionGroupService,
                                   QuestionService questionService,
                                   QuestionOptionService questionOptionService,
                                   UserQuizMockHisRepository userQuizMockHisRepository,
                                   UserQuesWrongRepository userQuesWrongRepository,
                                   UserService userService) {
        super(advancedFilterService, quizMockTestRepository, quizMockTestMapper, quizMockTestViewRepository);
        this.quizMockTestRepository = quizMockTestRepository;
        this.quizMockTestMapper = quizMockTestMapper;
        this.questionGroupService = questionGroupService;
        this.questionService = questionService;
        this.questionOptionService = questionOptionService;
        this.userQuizMockHisRepository = userQuizMockHisRepository;
        this.userQuesWrongRepository = userQuesWrongRepository;
        this.userService = userService;
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

    @Override
    public SubmitQuizResponse submitQuiz(Long quizId, SubmitQuizRequest request, String username) {
        log.info("Submitting quiz {} for user {}", quizId, username);

        QuizMockTest quiz = quizMockTestRepository.findByIdAndIsDeletedFalse(quizId)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Quiz not found: " + quizId));

        // gather questions
        List<QuestionResponse> allQuestions = questionService.findAll();
        List<QuestionResponse> questions = allQuestions.stream()
                .filter(q -> q.getQuizId() != null && q.getQuizId().equals(quizId))
                .sorted(Comparator.comparingLong((QuestionResponse q) -> q.getGroupId() != null ? q.getGroupId() : 0L).thenComparingInt(QuestionResponse::getOrderIndex))
                .toList();

        int total = questions.size();
        Map<Long, Long> answers = request.getAnswers() != null ? request.getAnswers() : new java.util.HashMap<>();
        int correct = 0;
        List<Map<String, Object>> answersList = new java.util.ArrayList<>();

        List<QuestionOptionResponse> allOptions = questionOptionService.findAll();

        for (QuestionResponse q : questions) {
            Long qId = q.getId();
            Long selected = answers.get(qId);

            // determine correct option id
            Long correctOptionId = null;
            for (QuestionOptionResponse opt : allOptions) {
                if (opt.getQuestionId() != null && opt.getQuestionId().equals(qId) && Boolean.TRUE.equals(opt.getIsCorrect())) {
                    correctOptionId = opt.getId();
                    break;
                }
            }

            boolean isCorrect = selected != null && correctOptionId != null && selected.equals(correctOptionId);
            Map<String, Object> answerEntry = new java.util.HashMap<>();
            answerEntry.put("questionId", qId);
            answerEntry.put("correctOptionId", correctOptionId);
            answerEntry.put("yourOptionId", selected);
            answerEntry.put("isCorrect", isCorrect);
            answerEntry.put("explanationHtml", q.getExplanationHtml());
            answersList.add(answerEntry);
            if (isCorrect) correct++;
        }

        double score = total == 0 ? 0.0 : ((double) correct / (double) total) * 10.0;
        // round to 2 decimals
        score = Math.round(score * 100.0) / 100.0;

        // persist history and wrong answers using injected repositories
        try {
            Long userId = null;
            if (this.userService != null) {
                try {
                    com.example.quiz.model.entity.user.User user = this.userService.handleGetUserByUsernameOrEmailOrPhone(username);
                    if (user != null) userId = user.getId();
                } catch (Exception e) {
                    log.debug("Failed to resolve user by username: {}", e.getMessage());
                }
            }

            if (userId != null && this.userQuizMockHisRepository != null) {
                UserQuizMockHis his = UserQuizMockHis.builder()
                        .userId(userId)
                        .quizMockTestId(quizId)
                        .score(score)
                        .totalQuestions(total)
                        .correctCount(correct)
                        .build();

                UserQuizMockHis saved = userQuizMockHisRepository.saveAndFlush(his);
                log.debug("Saved quiz history id={} for userId={}", saved.getId(), userId);

                // verify saved exists
                try {
                    boolean exists = userQuizMockHisRepository.findById(saved.getId()).isPresent();
                    log.debug("Verification: userQuizMockHis exists after save? {} (id={})", exists, saved.getId());
                } catch (Exception e) {
                    log.warn("Failed to verify saved userQuizMockHis: {}", e.getMessage());
                }

                if (this.userQuesWrongRepository != null) {
                    int wrongCount = 0;
                    for (Map<String, Object> w : answersList) {
                        Boolean isCorrectEntry = (Boolean) w.get("isCorrect");
                        if (isCorrectEntry != null && isCorrectEntry) continue; // only persist wrong answers
                        UserQuesWrong uw = UserQuesWrong.builder()
                                .userQuizHisId(saved.getId())
                                .questionId((Long) w.get("questionId"))
                                .selectedOptionId((Long) w.get("yourOptionId"))
                                .correctOptionId((Long) w.get("correctOptionId"))
                                .build();
                        UserQuesWrong savedWrong = userQuesWrongRepository.saveAndFlush(uw);
                        wrongCount++;
                        log.debug("Saved wrong question id={} for hisId={}", savedWrong.getId(), saved.getId());
                        try {
                            boolean existsW = userQuesWrongRepository.findById(savedWrong.getId()).isPresent();
                            log.debug("Verification: userQuesWrong exists after save? {} (id={})", existsW, savedWrong.getId());
                        } catch (Exception e) {
                            log.warn("Failed to verify saved userQuesWrong: {}", e.getMessage());
                        }
                    }
                    log.debug("Persisted {} wrong question(s) for hisId={}", wrongCount, saved.getId());
                }
            } else {
                log.debug("Skipping persisting quiz history because userId or repositories are not available (userId={})", userId);
            }
        } catch (Exception ex) {
            log.warn("Failed to persist quiz history: {}", ex.getMessage());
        }

        com.example.quiz.model.dto.response.SubmitQuizResponse response;
        if (Boolean.TRUE.equals(quiz.getIsShowAnswer())) {
            response = new com.example.quiz.model.dto.response.SubmitQuizResponse(score, total, correct, answersList);
        } else {
            response = new com.example.quiz.model.dto.response.SubmitQuizResponse(score, total, correct, null);
        }

        return response;
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
