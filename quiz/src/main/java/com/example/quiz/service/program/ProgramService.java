package com.example.quiz.service.program;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.entity.program.ProgramRequestDto;
import com.example.quiz.model.entity.program.ProgramResponseDto;
import com.example.quiz.model.entity.program.Program;
import com.example.quiz.model.entity.program.ProgramView;

import java.util.List;

public interface ProgramService extends BaseService<Program, Long, ProgramRequestDto, ProgramResponseDto, ProgramView> {

    List<ProgramResponseDto> getRootPrograms();
    List<ProgramResponseDto> getChildrenPrograms(Long parentId);
    ProgramResponseDto moveProgram(Long programId, Long newParentId);
    
    List<ProgramResponseDto> getProgramTree(Long rootId);
    List<ProgramResponseDto> getProgramHierarchy();
    
    List<ProgramResponseDto> getProgramsByLevel(Integer level);
    List<ProgramResponseDto> getLeafPrograms();
    
    List<ProgramResponseDto> searchProgramsByName(String name);
    
    boolean canHaveQuizzes(Long programId);
    boolean canBeParent(Long programId, Long childId);
    boolean isValidHierarchy(Long programId, Long parentId);
    
    ProgramResponseDto getProgramWithStatistics(Long programId);
    
    List<ProgramResponseDto> reorderPrograms(List<Long> programIds, List<Integer> displayOrders);
}
