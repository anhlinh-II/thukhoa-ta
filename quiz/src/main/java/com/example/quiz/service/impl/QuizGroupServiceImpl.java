package com.example.quiz.service.impl;

import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.QuizGroupMapper;
import com.example.quiz.model.dto.request.QuizGroupRequestDto;
import com.example.quiz.model.dto.response.QuizGroupResponseDto;
import com.example.quiz.model.entity.Program;
import com.example.quiz.model.entity.QuizGroup;
import com.example.quiz.model.view.QuizGroupView;
import com.example.quiz.repository.ProgramRepository;
import com.example.quiz.repository.QuizGroupRepository;
import com.example.quiz.repository.QuizGroupViewRepository;
import com.example.quiz.util.SlugUtils;
import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.service.QuizGroupService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class QuizGroupServiceImpl extends BaseServiceImpl<QuizGroup, Long, QuizGroupRequestDto, QuizGroupResponseDto, QuizGroupView> implements QuizGroupService {

    private final QuizGroupRepository quizGroupRepository;
    private final QuizGroupViewRepository quizGroupViewRepository;
    private final ProgramRepository programRepository;

    public QuizGroupServiceImpl(
            AdvancedFilterService advancedFilterService,
            QuizGroupRepository quizGroupRepository,
            QuizGroupViewRepository quizGroupViewRepository,
            QuizGroupMapper mapper,
            ProgramRepository programRepository) {
        super(advancedFilterService, quizGroupRepository, mapper, quizGroupViewRepository);
        this.quizGroupRepository = quizGroupRepository;
        this.quizGroupViewRepository = quizGroupViewRepository;
        this.programRepository = programRepository;
    }

    @Override
    protected Class<QuizGroupView> getViewClass() {
        return QuizGroupView.class;
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizGroupResponseDto> findByProgramId(Long programId) {
        List<QuizGroupView> views = quizGroupViewRepository.findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(programId);
        return views.stream().map(this::viewToResponseDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizGroupResponseDto> findByProgramIdAndGroupType(Long programId, QuizGroup.GroupType groupType) {
        List<QuizGroupView> views = quizGroupViewRepository.findByProgramIdAndGroupTypeAndIsDeletedFalseOrderByDisplayOrder(programId, 
                QuizGroupView.GroupType.valueOf(groupType.name()));
        return views.stream().map(this::viewToResponseDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuizGroupResponseDto> findActiveByProgramId(Long programId) {
        List<QuizGroupView> views = quizGroupViewRepository.findActiveByProgramId(programId);
        return views.stream().map(this::viewToResponseDto).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public QuizGroupResponseDto getQuizGroupById(Long id) {
        QuizGroupView view = quizGroupViewRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_GROUP_NOT_FOUND));
        return viewToResponseDto(view);
    }

    @Override
    @Transactional(readOnly = true)
    public QuizGroupResponseDto findBySlug(String slug) {
        QuizGroupView view = quizGroupViewRepository.findBySlugAndIsDeletedFalse(slug)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_GROUP_NOT_FOUND));
        return viewToResponseDto(view);
    }

    @Override
    public QuizGroupResponseDto update(Long id, QuizGroupRequestDto requestDto) {
        validateUpdateRequest(requestDto, id);
        return super.update(id, requestDto);
    }

    @Override
    public void deleteById(Long id) {
        super.deleteById(id);
    }

    @Override
    public void softDeleteById(Long id) {
        QuizGroup entity = findEntityById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_GROUP_NOT_FOUND));
        entity.setIsDeleted(true);
        entity.setIsActive(false);
        quizGroupRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsBySlug(String slug) {
        return quizGroupRepository.existsBySlugAndIsDeletedFalse(slug);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countByProgramIdAndGroupType(Long programId, QuizGroup.GroupType groupType) {
        return quizGroupRepository.countByProgramIdAndGroupType(programId, groupType);
    }

    @Override
    public void validateBeforeUpdate(Long id, QuizGroupRequestDto requestDto) {
        super.validateBeforeUpdate(id, requestDto);
        validateUpdateRequest(requestDto, id);
    }

    @Override
    public void validateBeforeCreate(QuizGroupRequestDto requestDto) {
//        if (existsBySlug(requestDto.getSlug())) {
//            throw new AppException(ErrorCode.SLUG_ALREADY_EXISTS);
//        }
//
//        if (!programRepository.existsById(requestDto.getProgramId())) {
//            throw new AppException(ErrorCode.PROGRAM_NOT_FOUND);
//        }
    }

    private void validateUpdateRequest(QuizGroupRequestDto requestDto, Long id) {
        QuizGroup existingEntity = findEntityById(id)
                .orElseThrow(() -> new AppException(ErrorCode.QUIZ_GROUP_NOT_FOUND));
        
        // Determine target slug: if request provides a slug use it, otherwise generate from the new name
        String targetSlug = null;
        if (requestDto.getSlug() != null && !requestDto.getSlug().isBlank()) {
            targetSlug = requestDto.getSlug();
        } else if (requestDto.getName() != null && !requestDto.getName().isBlank()) {
            targetSlug = SlugUtils.generateSlug(requestDto.getName());
        }

        // Check slug uniqueness if changed (null-safe). If targetSlug is null, skip uniqueness check.
        if (targetSlug != null && !java.util.Objects.equals(existingEntity.getSlug(), targetSlug) && existsBySlug(targetSlug)) {
            throw new AppException(ErrorCode.SLUG_ALREADY_EXISTS);
        }
        
        if (requestDto.getProgramId() != null && !programRepository.existsById(requestDto.getProgramId())) {
            throw new AppException(ErrorCode.PROGRAM_NOT_FOUND);
        }
    }

    @Override
    public void beforeUpdate(Long id, QuizGroupRequestDto requestDto, QuizGroup existingEntity) {
        // If request does not provide a slug, generate one from the (new) name and set it on the entity so
        // the slug follows the updated name. If request provides slug, leave it to mapper to set it.
        if ((requestDto.getSlug() == null || requestDto.getSlug().isBlank()) && requestDto.getName() != null) {
            String generated = SlugUtils.generateSlug(requestDto.getName());
            existingEntity.setSlug(generated);
        }
    }

    private QuizGroupResponseDto viewToResponseDto(QuizGroupView view) {
        QuizGroupResponseDto dto = new QuizGroupResponseDto();
        dto.setId(view.getId());
        dto.setProgramId(view.getProgramId());
        dto.setName(view.getName());
        dto.setDescription(view.getDescription());
        dto.setSlug(view.getSlug());
        dto.setGroupType(QuizGroup.GroupType.valueOf(view.getGroupType().name()));
        dto.setDisplayOrder(view.getDisplayOrder());
        dto.setIsActive(view.getIsActive());
        dto.setIsDeleted(view.getIsDeleted());
        dto.setCreatedAt(view.getCreatedAt());
        dto.setCreatedBy(view.getCreatedBy());
        dto.setUpdatedAt(view.getUpdatedAt());
        dto.setUpdatedBy(view.getUpdatedBy());
        return dto;
    }
}
