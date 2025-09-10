package com.example.quiz.service.impl;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.ProgramMapper;
import com.example.quiz.model.dto.request.ProgramRequestDto;
import com.example.quiz.model.dto.response.ProgramResponseDto;
import com.example.quiz.model.entity.Program;
import com.example.quiz.model.view.ProgramView;
import com.example.quiz.repository.ProgramRepository;
import com.example.quiz.repository.ProgramViewRepository;
import com.example.quiz.service.ProgramService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@Transactional
public class ProgramServiceImpl extends BaseServiceImpl<Program, Long, ProgramRequestDto, ProgramResponseDto, ProgramView>
        implements ProgramService {

    private final ProgramRepository programRepository;
    private final ProgramViewRepository programViewRepository;
    private final ProgramMapper programMapper;

    public ProgramServiceImpl(
            AdvancedFilterService advancedFilterService,
            ProgramRepository programRepository,
            ProgramMapper programMapper,
            ProgramViewRepository programViewRepository) {
        super(advancedFilterService, programRepository, programMapper, programViewRepository);
        this.programRepository = programRepository;
        this.programViewRepository = programViewRepository;
        this.programMapper = programMapper;
    }

    @Override
    protected Class<ProgramView> getViewClass() {
        return ProgramView.class;
    }

    // Enhanced validation methods - override parent validation
    @Override
    public void validateBeforeCreate(ProgramRequestDto request) {
        super.validateBeforeCreate(request);
        
        // Check for duplicate names under same parent
        if (request.getParentId() != null) {
            if (programRepository.existsByNameAndParentId(request.getName(), request.getParentId())) {
                throw new AppException(ErrorCode.ENTITY_EXISTED);
            }
        } else {
            if (programRepository.existsByNameAndParentIsNull(request.getName())) {
                throw new AppException(ErrorCode.ENTITY_EXISTED);
            }
        }
        
        // Validate parent exists if provided
        if (request.getParentId() != null && !programRepository.existsById(request.getParentId())) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        }
    }

    @Override
    public void validateBeforeUpdate(Long id, ProgramRequestDto request) {
        super.validateBeforeUpdate(id, request);
        
        Program existingProgram = programRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        // Check for duplicate names (excluding current program)
        if (request.getParentId() != null) {
            Optional<Program> duplicate = programRepository.findAll().stream()
                    .filter(p -> !p.getId().equals(id))
                    .filter(p -> p.getName().equals(request.getName()))
                    .filter(p -> p.getParent() != null && p.getParent().getId().equals(request.getParentId()))
                    .findFirst();
            if (duplicate.isPresent()) {
                throw new AppException(ErrorCode.ENTITY_EXISTED);
            }
        } else {
            Optional<Program> duplicate = programRepository.findAll().stream()
                    .filter(p -> !p.getId().equals(id))
                    .filter(p -> p.getName().equals(request.getName()))
                    .filter(p -> p.getParent() == null)
                    .findFirst();
            if (duplicate.isPresent()) {
                throw new AppException(ErrorCode.ENTITY_EXISTED);
            }
        }
        
        // Validate hierarchy if parent is changing
        if (request.getParentId() != null) {
            if (!isValidHierarchy(id, request.getParentId())) {
                throw new AppException(ErrorCode.INVALID_ACTION);
            }
        }
    }

    @Override
    public void validateBeforeDelete(Long id) {
        super.validateBeforeDelete(id);
        
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        // Cannot delete if has children
        if (!program.isLeaf()) {
            throw new AppException(ErrorCode.INVALID_ACTION);
        }
        
        // Cannot delete if has quizzes
        if (program.getQuizzes() != null && !program.getQuizzes().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_ACTION);
        }
    }

    // Override create to handle parent relationship
    @Override
    public ProgramResponseDto create(ProgramRequestDto request) {
        validateBeforeCreate(request);
        
        Program program = programMapper.requestToEntity(request);
        
        // Set parent if provided
        if (request.getParentId() != null) {
            Program parent = programRepository.findById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
            program.setParent(parent);
        }
        
        Program savedProgram = programRepository.save(program);
        return programMapper.entityToResponse(savedProgram);
    }

    // Override update to handle parent relationship
    @Override
    public ProgramResponseDto update(Long id, ProgramRequestDto request) {
        validateBeforeUpdate(id, request);
        
        Program existingProgram = programRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        programMapper.updateEntityFromRequest(request, existingProgram);
        
        // Update parent if changed
        if (request.getParentId() != null) {
            if (existingProgram.getParent() == null || 
                !existingProgram.getParent().getId().equals(request.getParentId())) {
                Program newParent = programRepository.findById(request.getParentId())
                        .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
                existingProgram.setParent(newParent);
            }
        } else {
            existingProgram.setParent(null);
        }
        
        Program savedProgram = programRepository.save(existingProgram);
        return programMapper.entityToResponse(savedProgram);
    }

    // Hierarchy management methods - specialized business logic
    @Override
    @Transactional(readOnly = true)
    public List<ProgramResponseDto> getRootPrograms() {
        return programViewRepository.findByParentIdIsNullAndIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(programMapper::viewToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramResponseDto> getChildrenPrograms(Long parentId) {
        return programViewRepository.findByParentIdAndIsActiveTrueOrderByDisplayOrderAsc(parentId)
                .stream()
                .map(programMapper::viewToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProgramResponseDto moveProgram(Long programId, Long newParentId) {
        if (!isValidHierarchy(programId, newParentId)) {
            throw new AppException(ErrorCode.INVALID_ACTION);
        }
        
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        if (newParentId != null) {
            Program newParent = programRepository.findById(newParentId)
                    .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
            program.setParent(newParent);
        } else {
            program.setParent(null);
        }
        
        Program savedProgram = programRepository.save(program);
        return programMapper.entityToResponse(savedProgram);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramResponseDto> getProgramTree(Long rootId) {
        return programViewRepository.findHierarchyTree(rootId)
                .stream()
                .map(programMapper::viewToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramResponseDto> getProgramHierarchy() {
        return programViewRepository.findByParentIdIsNullAndIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::buildHierarchy)
                .collect(Collectors.toList());
    }

    private ProgramResponseDto buildHierarchy(ProgramView programView) {
        ProgramResponseDto dto = programMapper.viewToResponse(programView);
        List<ProgramResponseDto> children = getChildrenPrograms(programView.getId());
        dto.setChildren(children);
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramResponseDto> getProgramsByLevel(Integer level) {
        return programViewRepository.findByLevelAndIsActiveTrueOrderByDisplayOrderAsc(level)
                .stream()
                .map(programMapper::viewToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramResponseDto> getLeafPrograms() {
        return programViewRepository.findByIsLeafTrueAndIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(programMapper::viewToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramResponseDto> searchProgramsByName(String name) {
        return programViewRepository.findByNameContainingIgnoreCase(name)
                .stream()
                .map(programMapper::viewToResponse)
                .collect(Collectors.toList());
    }

    // Validation methods - specialized business logic
    @Override
    public boolean canHaveQuizzes(Long programId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        return program.canHaveQuizzes();
    }

    @Override
    public boolean canBeParent(Long programId, Long childId) {
        return isValidHierarchy(childId, programId);
    }

    @Override
    public boolean isValidHierarchy(Long programId, Long parentId) {
        if (parentId == null) return true;
        if (programId.equals(parentId)) return false;
        
        // Check for circular reference
        return programRepository.checkCircularReference(parentId, programId) == 0;
    }

    @Override
    @Transactional(readOnly = true)
    public ProgramResponseDto getProgramWithStatistics(Long programId) {
        Program program = programRepository.findById(programId)
                .orElseThrow(() -> new AppException(ErrorCode.ENTITY_NOT_EXISTED));
        
        ProgramResponseDto response = programMapper.entityToResponse(program);
        
        // Add path information
        Optional<String> path = programRepository.findProgramPath(programId);
        path.ifPresent(response::setPath);
        
        return response;
    }

    @Override
    public List<ProgramResponseDto> reorderPrograms(List<Long> programIds, List<Integer> displayOrders) {
        if (programIds.size() != displayOrders.size()) {
            throw new AppException(ErrorCode.INVALID_ACTION);
        }
        
        List<Program> programs = programRepository.findAllById(programIds);
        
        for (int i = 0; i < programs.size(); i++) {
            programs.get(i).setDisplayOrder(displayOrders.get(i));
        }
        
        List<Program> savedPrograms = programRepository.saveAll(programs);
        return savedPrograms.stream()
                .map(programMapper::entityToResponse)
                .collect(Collectors.toList());
    }
}
