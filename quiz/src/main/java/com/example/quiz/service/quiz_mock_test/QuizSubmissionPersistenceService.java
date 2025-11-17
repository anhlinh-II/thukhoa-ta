package com.example.quiz.service.quiz_mock_test;

import com.example.quiz.enums.GroupType;
import com.example.quiz.model.entity.user_quiz_mock_his.UserQuizMockHis;
import com.example.quiz.model.entity.user_question_answer.UserQuestionAnswer;
import com.example.quiz.model.entity.user_ques_wrong.UserQuesWrong;
import com.example.quiz.repository.user_question_answer.UserQuestionAnswerRepository;
import com.example.quiz.repository.user_quiz_mock_his.UserQuizMockHisRepository;
import com.example.quiz.repository.user_ques_wrong.UserQuesWrongRepository;
import com.example.quiz.service.user_learning_item.Sm2Service;
import com.example.quiz.enums.LearningType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class QuizSubmissionPersistenceService {

    private final UserQuizMockHisRepository hisRepository;
    private final UserQuesWrongRepository wrongRepository;
    private final UserQuestionAnswerRepository answerRepository;
    private final Sm2Service sm2Service;

    public QuizSubmissionPersistenceService(UserQuizMockHisRepository hisRepository,
                                            UserQuesWrongRepository wrongRepository,
                                            UserQuestionAnswerRepository answerRepository,
                                            Sm2Service sm2Service) {
        this.hisRepository = hisRepository;
        this.wrongRepository = wrongRepository;
        this.answerRepository = answerRepository;
        this.sm2Service = sm2Service;
    }

    /**
     * Persist quiz result and per-question records in a separate transaction.
     * This uses REQUIRES_NEW so failures here won't mark the caller's transaction rollback-only.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Long persistResultAndDetails(Long userId, Long quizId, double score, int timeSpent, int total, int correct, List<Map<String, Object>> answersList) {
        UserQuizMockHis his = UserQuizMockHis.builder()
                .userId(userId)
                .quizMockTestId(quizId)
                .score(score)
                .quizType(GroupType.MOCK_TEST)
                .timeSpent(timeSpent)
                .totalQuestions(total)
                .correctCount(correct)
                .build();

        UserQuizMockHis saved = hisRepository.saveAndFlush(his);

        if (answersList != null) {
            for (Map<String, Object> a : answersList) {
                Boolean isCorrect = (Boolean) a.get("isCorrect");
                Long qId = (Long) a.get("questionId");
                Long yourOpt = a.get("yourOptionId") == null ? null : (Long) a.get("yourOptionId");

                // persist per-question answer
                try {
                    // be robust to numeric types coming from maps (Integer vs Long)
                    Long questionIdLong = null;
                    if (qId instanceof Number) {
                        questionIdLong = ((Number) qId).longValue();
                    }
                    Long yourOptLong = null;
                    if (yourOpt instanceof Number) {
                        yourOptLong = ((Number) yourOpt).longValue();
                    }

                    UserQuestionAnswer uqa = new UserQuestionAnswer();
                    uqa.setUserId(userId);
                    uqa.setQuestionId(questionIdLong);
                    uqa.setQuizHisId(saved.getId());
                    uqa.setQuestionOptionId(yourOptLong);
                    uqa.setTimeSpent(0);
                    uqa.setIsCorrect(isCorrect);
                    answerRepository.saveAndFlush(uqa);
                } catch (Exception ex) {
                    // log failure but continue persisting other records
                    System.err.println("Failed to persist UserQuestionAnswer: " + ex.getMessage());
                }

                // persist wrong question record and sm2
                if (isCorrect == null || !isCorrect) {
                    try {
                        // normalize numeric types
                        Long questionIdLong = null;
                        if (qId instanceof Number) questionIdLong = ((Number) qId).longValue();
                        Long selOptLong = null;
                        if (yourOpt instanceof Number) selOptLong = ((Number) yourOpt).longValue();
                        Long corrOpt = null;
                        Object corrObj = a.get("correctOptionId");
                        if (corrObj instanceof Number) corrOpt = ((Number) corrObj).longValue();

                        UserQuesWrong uw = UserQuesWrong.builder()
                                .userQuizHisId(saved.getId())
                                .questionId(questionIdLong)
                                .selectedOptionId(selOptLong)
                                .correctOptionId(corrOpt)
                                .build();
                        wrongRepository.saveAndFlush(uw);

                        // create or update learning item for SM-2
                        try {
                            sm2Service.createIfAbsentAndMarkWrong(userId, questionIdLong, LearningType.MOCKTEST);
                        } catch (Exception ex2) {
                            System.err.println("SM2 create failed: " + ex2.getMessage());
                        }
                    } catch (Exception ex) {
                        System.err.println("Failed to persist UserQuesWrong: " + ex.getMessage());
                    }
                }
            }
        }

        return saved.getId();
    }
}
