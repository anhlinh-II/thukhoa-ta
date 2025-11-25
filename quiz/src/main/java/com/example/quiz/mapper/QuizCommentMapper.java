package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.quiz_comment.QuizComment;
import com.example.quiz.model.entity.quiz_comment.QuizCommentRequestDto;
import com.example.quiz.model.entity.quiz_comment.QuizCommentResponseDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface QuizCommentMapper extends BaseMapstruct<QuizComment, QuizCommentRequestDto, QuizCommentResponseDto, QuizComment> {

}
