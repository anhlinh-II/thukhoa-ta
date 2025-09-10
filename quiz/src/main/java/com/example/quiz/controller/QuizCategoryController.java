package com.example.quiz.controller;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.base.impl.BaseController;
import com.example.quiz.model.dto.request.QuizCategoryRequest;
import com.example.quiz.model.dto.response.QuizCategoryResponse;
import com.example.quiz.model.entity.QuizCategory;
import com.example.quiz.model.view.QuizCategoryView;
import com.example.quiz.service.interfaces.QuizCategoryService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/quiz-categories")
public class QuizCategoryController extends BaseController<QuizCategory, Long, QuizCategoryRequest, QuizCategoryResponse, QuizCategoryView, QuizCategoryService> {

    protected QuizCategoryController(QuizCategoryService service) {
        super(service);
    }
}
