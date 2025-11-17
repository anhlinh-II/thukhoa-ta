package com.example.quiz.service.user_quiz_history;

import com.example.quiz.model.dto.response.UserQuizHisResponse;
import org.springframework.data.domain.Page;

public interface UserQuizMockHisService {
    Page<UserQuizHisResponse> getMyHistory(int page, int size, String quizType);
    com.example.quiz.model.dto.response.QuizHistoryDetailResponse getHistoryDetail(Long historyId);
}
