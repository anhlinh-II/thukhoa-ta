package com.example.quiz.service.impl;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.QuizCategoryMapper;
import com.example.quiz.model.dto.request.QuizCategoryRequest;
import com.example.quiz.model.dto.response.QuizCategoryResponse;
import com.example.quiz.model.entity.QuizCategory;
import com.example.quiz.model.view.QuizCategoryView;
import com.example.quiz.repository.QuizCategoryRepository;
import com.example.quiz.repository.QuizCategoryViewRepository;
import com.example.quiz.service.interfaces.QuizCategoryService;
import org.springframework.stereotype.Service;

@Service
public class QuizCategoryServiceImpl extends BaseServiceImpl<QuizCategory, Long, QuizCategoryRequest, QuizCategoryResponse, QuizCategoryView>
        implements QuizCategoryService {

    public QuizCategoryServiceImpl(
            AdvancedFilterService advancedFilterService,
            QuizCategoryRepository quizCategoryRepository,
            QuizCategoryMapper quizCategoryMapper,
            QuizCategoryViewRepository quizCategoryViewRepository) {
        super(advancedFilterService, quizCategoryRepository, quizCategoryMapper, quizCategoryViewRepository);
    }

    @Override
    protected Class<QuizCategoryView> getViewClass() {
        return QuizCategoryView.class;
    }
}
