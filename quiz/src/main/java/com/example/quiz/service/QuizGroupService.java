package com.example.quiz.service;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.dto.request.QuizGroupRequestDto;
import com.example.quiz.model.dto.response.QuizGroupResponseDto;
import com.example.quiz.model.entity.QuizGroup;
import com.example.quiz.model.view.QuizGroupView;

import java.util.List;

public interface QuizGroupService extends BaseService<QuizGroup, Long, QuizGroupRequestDto, QuizGroupResponseDto, QuizGroupView> {

    List<QuizGroupResponseDto> findByProgramId(Long programId);

    List<QuizGroupResponseDto> findByProgramIdAndGroupType(Long programId, QuizGroup.GroupType groupType);

    List<QuizGroupResponseDto> findActiveByProgramId(Long programId);

    QuizGroupResponseDto getQuizGroupById(Long id);

    QuizGroupResponseDto findBySlug(String slug);

    QuizGroupResponseDto create(QuizGroupRequestDto requestDto);

    QuizGroupResponseDto update(Long id, QuizGroupRequestDto requestDto);

    void deleteById(Long id);

    void softDeleteById(Long id);

    boolean existsBySlug(String slug);

    Long countByProgramIdAndGroupType(Long programId, QuizGroup.GroupType groupType);
}
