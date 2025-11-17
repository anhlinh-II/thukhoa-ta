package com.example.quiz.service.user_quiz_history;

import com.example.quiz.model.dto.response.UserQuizHisResponse;
import com.example.quiz.model.dto.response.HistoryQuestionDto;
import com.example.quiz.model.dto.response.QuizHistoryDetailResponse;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswer;
import com.example.quiz.model.entity.question.QuestionResponse;
import com.example.quiz.model.entity.question_option.QuestionOptionResponse;
import com.example.quiz.repository.user_quiz_mock_his.UserQuizMockHisRepository;
import com.example.quiz.repository.user_question_answer.UserQuestionAnswerRepository;
import com.example.quiz.service.question.QuestionService;
import com.example.quiz.service.question_option.QuestionOptionService;
import com.example.quiz.service.interfaces.UserService;
import com.example.quiz.utils.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserQuizMockHisServiceImpl implements UserQuizMockHisService {

    private final UserQuizMockHisRepository userQuizMockHisRepository;
    private final UserQuestionAnswerRepository userQuestionAnswerRepository;
    private final QuestionService questionService;
    private final QuestionOptionService questionOptionService;
    private final com.example.quiz.repository.quiz_mock_test.QuizMockTestRepository quizMockTestRepository;
    private final UserService userService;

    public UserQuizMockHisServiceImpl(UserQuizMockHisRepository userQuizMockHisRepository,
                                      UserQuestionAnswerRepository userQuestionAnswerRepository,
                                      QuestionService questionService,
                                      QuestionOptionService questionOptionService,
                                      com.example.quiz.repository.quiz_mock_test.QuizMockTestRepository quizMockTestRepository,
                                      UserService userService) {
        this.userQuizMockHisRepository = userQuizMockHisRepository;
        this.userQuestionAnswerRepository = userQuestionAnswerRepository;
        this.questionService = questionService;
        this.questionOptionService = questionOptionService;
        this.quizMockTestRepository = quizMockTestRepository;
        this.userService = userService;
    }

    @Override
    public Page<UserQuizHisResponse> getMyHistory(int page, int size, String quizType) {
        String username = SecurityUtils.getCurrentUserLogin().orElse(null);
        if (username == null) return Page.empty();

        com.example.quiz.model.entity.user.User user = userService.handleGetUserByUsernameOrEmailOrPhone(username);
        if (user == null) return Page.empty();

        PageRequest pr = PageRequest.of(Math.max(0, page), Math.max(1, size));
        Page<UserQuizMockHis> p;
        if (quizType != null && !quizType.isEmpty()) {
            try {
                com.example.quiz.enums.GroupType gt = com.example.quiz.enums.GroupType.valueOf(quizType.toUpperCase());
                p = userQuizMockHisRepository.findAllByUserIdAndQuizTypeOrderByCreatedAtDesc(user.getId(), gt, pr);
            } catch (IllegalArgumentException ex) {
                // unknown type -> return empty
                return Page.empty();
            }
        } else {
            p = userQuizMockHisRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId(), pr);
        }

        List<UserQuizHisResponse> items = p.stream().map(h -> new UserQuizHisResponse(h.getId(), h.getQuizMockTestId(), h.getScore(), h.getTotalQuestions(), h.getCorrectCount(), h.getCreatedAt(), h.getQuizType() == null ? null : h.getQuizType().name())).collect(Collectors.toList());

        return new PageImpl<>(items, pr, p.getTotalElements());
    }

    @Override
    public QuizHistoryDetailResponse getHistoryDetail(Long historyId) {
        String username = com.example.quiz.utils.SecurityUtils.getCurrentUserLogin().orElse(null);
        if (username == null) return null;

        com.example.quiz.model.entity.user.User user = userService.handleGetUserByUsernameOrEmailOrPhone(username);
        if (user == null) return null;

        UserQuizMockHis his = userQuizMockHisRepository.findById(historyId).orElse(null);
        if (his == null) return null;
        if (!his.getUserId().equals(user.getId())) return null;

        Long quizId = his.getQuizMockTestId();

        // determine whether this quiz allows explanation display
        Boolean isShowExplain = false;
        if (quizId != null) {
            com.example.quiz.model.entity.quiz_mock_test.QuizMockTest quiz = quizMockTestRepository.findById(quizId).orElse(null);
            if (quiz != null) isShowExplain = Boolean.TRUE.equals(quiz.getIsShowExplain());
        }

        // gather questions for the quiz (same ordering as preview)
        List<QuestionResponse> allQuestions = questionService.findAll();
        List<QuestionResponse> questions = allQuestions.stream()
                .filter(q -> q.getQuizId() != null && q.getQuizId().equals(quizId))
                .sorted(java.util.Comparator.comparingLong((QuestionResponse q) -> q.getGroupId() != null ? q.getGroupId() : 0L)
                        .thenComparingInt(QuestionResponse::getOrderIndex))
                .toList();

        // load user answers for this history
        List<UserQuestionAnswer> userAnswers = userQuestionAnswerRepository.findAllByQuizHisId(his.getId());

        // load all options to determine correct option per question
        List<QuestionOptionResponse> allOptions = questionOptionService.findAll();

        List<HistoryQuestionDto> qDtos = new java.util.ArrayList<>();
        int idx = 1;
        for (QuestionResponse q : questions) {
            Long qId = q.getId();
            Long correctOptionId = null;
            for (QuestionOptionResponse opt : allOptions) {
                if (opt.getQuestionId() != null && opt.getQuestionId().equals(qId) && Boolean.TRUE.equals(opt.getIsCorrect())) {
                    correctOptionId = opt.getId();
                    break;
                }
            }

            // find user's answer
            Long userOptionId = null;
            Boolean isCorrect = null;
            for (UserQuestionAnswer ua : userAnswers) {
                if (ua.getQuestionId() != null && ua.getQuestionId().equals(qId)) {
                    userOptionId = ua.getQuestionOptionId();
                    isCorrect = ua.getIsCorrect();
                    break;
                }
            }

            HistoryQuestionDto hq = new HistoryQuestionDto(qId, idx, correctOptionId, userOptionId, isCorrect);
            qDtos.add(hq);
            idx++;
        }

        return new QuizHistoryDetailResponse(his.getId(), quizId, his.getTotalQuestions(), his.getCorrectCount(), qDtos, isShowExplain);
    }
}
