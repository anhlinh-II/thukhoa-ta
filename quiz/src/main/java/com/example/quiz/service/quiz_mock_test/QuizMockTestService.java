package com.example.quiz.service.quiz_mock_test;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.dto.request.SubmitQuizRequest;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestRequestDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestResponseDto;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTest;
import com.example.quiz.model.entity.quiz_mock_test.QuizMockTestView;

import com.example.quiz.model.dto.response.SubmitQuizResponse;
import java.util.Map;

public interface QuizMockTestService extends BaseService<QuizMockTest, Long, QuizMockTestRequestDto, QuizMockTestResponseDto, QuizMockTestView> {
    Map<String, Object> getQuizPreview(Long quizId);
    SubmitQuizResponse submitQuiz(Long quizId, SubmitQuizRequest request, String username);
}
