package com.example.quiz.service.flashcard_category;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.FlashcardCategoryMapper;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategory;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryRequest;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryResponse;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategoryView;
import com.example.quiz.repository.flashcard_category.FlashcardCategoryRepository;
import com.example.quiz.repository.flashcard_category.FlashcardCategoryViewRepository;
import com.example.quiz.repository.flashcard_item.FlashcardItemRepository;
import com.example.quiz.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FlashcardCategoryServiceImpl extends BaseServiceImpl<FlashcardCategory, Long, FlashcardCategoryRequest, FlashcardCategoryResponse, FlashcardCategoryView> implements FlashcardCategoryService {

    private final FlashcardCategoryRepository categoryRepo;
    private final FlashcardCategoryViewRepository viewRepo;
    private final FlashcardItemRepository itemRepo;
    private final FlashcardCategoryMapper categoryMapper;

    public FlashcardCategoryServiceImpl(
            AdvancedFilterService advancedFilterService,
            FlashcardCategoryRepository repository,
            FlashcardCategoryMapper mapper,
            FlashcardCategoryViewRepository viewRepository,
            FlashcardItemRepository itemRepo) {
        super(advancedFilterService, repository, mapper, viewRepository);
        this.categoryRepo = repository;
        this.viewRepo = viewRepository;
        this.itemRepo = itemRepo;
        this.categoryMapper = mapper;
    }

    @Override
    protected Class<FlashcardCategoryView> getViewClass() {
        return FlashcardCategoryView.class;
    }

    @Override
    public List<FlashcardCategoryResponse> getCategoriesByUserId(Long userId) {
        List<FlashcardCategory> categories = categoryRepo.findByUserIdOrderByCreatedAtDesc(userId);
        return categories.stream()
                .map(categoryMapper::entityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void beforeCreate(FlashcardCategoryRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId != null && request.getUserId() == null) {
            request.setUserId(currentUserId);
        }
        
        if (request.getColor() == null || request.getColor().isBlank()) {
            request.setColor("#3b82f6");
        }
        if (request.getIcon() == null || request.getIcon().isBlank()) {
            request.setIcon("folder");
        }
    }

    @Override
    public void afterCreate(FlashcardCategory entity, FlashcardCategoryResponse response, FlashcardCategoryRequest request) {
        log.info("Created flashcard category: {} for user: {}", entity.getName(), entity.getUserId());
    }

    @Override
    public void validateBeforeCreate(FlashcardCategoryRequest request) {
        if (request.getName() == null || request.getName().isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Long userId = request.getUserId();
        if (userId == null) {
            userId = SecurityUtils.getCurrentUserId().orElse(null);
        }
        
        if (userId != null && categoryRepo.existsByUserIdAndName(userId, request.getName().trim())) {
            throw new AppException(ErrorCode.ENTITY_EXISTED);
        }
    }

    @Override
    public void beforeUpdate(Long id, FlashcardCategoryRequest request, FlashcardCategory existingEntity) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId != null && !currentUserId.equals(existingEntity.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public void beforeDelete(Long id, FlashcardCategory existingEntity) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId != null && !currentUserId.equals(existingEntity.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    @Transactional
    public void deleteById(Long id) {
        FlashcardCategory category = findById(id);
        beforeDelete(id, category);
        
        itemRepo.deleteByCategoryId(id);
        
        categoryRepo.deleteById(id);
        
        afterDelete(id, category);
    }

    public void updateCardCount(Long categoryId) {
        FlashcardCategory category = categoryRepo.findById(categoryId).orElse(null);
        if (category != null) {
            int count = itemRepo.countByCategoryId(categoryId);
            category.setCardCount(count);
            categoryRepo.save(category);
        }
    }
}
