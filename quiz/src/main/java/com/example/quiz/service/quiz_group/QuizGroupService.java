package com.example.quiz.service.quiz_group;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.quiz_group.QuizGroupRequestDto;
import com.example.quiz.model.entity.quiz_group.QuizGroupResponseDto;
import com.example.quiz.model.entity.quiz_group.QuizGroup;
import com.example.quiz.model.entity.quiz_group.QuizGroupView;

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
