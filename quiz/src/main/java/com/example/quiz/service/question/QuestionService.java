package com.example.quiz.service.question;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.question.Question;
import com.example.quiz.model.entity.question.QuestionRequest;
import com.example.quiz.model.entity.question.QuestionResponse;
import com.example.quiz.model.entity.question.QuestionView;

public interface QuestionService extends BaseService<Question, Long, QuestionRequest, QuestionResponse, QuestionView> {
}
