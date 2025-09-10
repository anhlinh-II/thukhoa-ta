package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.dto.response.QuizResponse;
import com.example.quiz.model.dto.resquest.QuizRequest;
import com.example.quiz.model.entity.Quiz;
import com.example.quiz.model.view.QuizView;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface QuizMapper extends BaseMapstruct<Quiz, QuizRequest, QuizResponse, QuizView> {

    // Explicit method implementations to help MapStruct generate proper code
    @Override
    Quiz requestToEntity(QuizRequest request);

    @Override
    QuizResponse entityToResponse(Quiz entity);

    @Override
    QuizResponse viewToResponse(QuizView view);

    @Override
    void updateEntityFromRequest(QuizRequest request, @MappingTarget Quiz entity);
}
