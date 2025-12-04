package com.example.quiz.service.flashcard_item;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.mapper.FlashcardItemMapper;
import com.example.quiz.model.entity.flashcard_category.FlashcardCategory;
import com.example.quiz.model.entity.flashcard_item.FlashcardItem;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemRequest;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemResponse;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemView;
import com.example.quiz.repository.flashcard_category.FlashcardCategoryRepository;
import com.example.quiz.repository.flashcard_item.FlashcardItemRepository;
import com.example.quiz.repository.flashcard_item.FlashcardItemViewRepository;
import com.example.quiz.service.flashcard_category.FlashcardCategoryServiceImpl;
import com.example.quiz.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FlashcardItemServiceImpl extends BaseServiceImpl<FlashcardItem, Long, FlashcardItemRequest, FlashcardItemResponse, FlashcardItemView> implements FlashcardItemService {

    private final FlashcardItemRepository itemRepo;
    private final FlashcardItemViewRepository viewRepo;
    private final FlashcardCategoryRepository categoryRepo;
    private final FlashcardCategoryServiceImpl categoryService;
    private final FlashcardItemMapper itemMapper;

    public FlashcardItemServiceImpl(
            AdvancedFilterService advancedFilterService,
            FlashcardItemRepository repository,
            FlashcardItemMapper mapper,
            FlashcardItemViewRepository viewRepository,
            FlashcardCategoryRepository categoryRepo,
            @Lazy FlashcardCategoryServiceImpl categoryService) {
        super(advancedFilterService, repository, mapper, viewRepository);
        this.itemRepo = repository;
        this.viewRepo = viewRepository;
        this.categoryRepo = categoryRepo;
        this.categoryService = categoryService;
        this.itemMapper = mapper;
    }

    @Override
    protected Class<FlashcardItemView> getViewClass() {
        return FlashcardItemView.class;
    }

    @Override
    public List<FlashcardItemResponse> getItemsByCategoryId(Long categoryId) {
        List<FlashcardItem> items = itemRepo.findByCategoryIdOrderBySortOrderAsc(categoryId);
        return items.stream()
                .map(itemMapper::entityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FlashcardItemResponse> getItemsByUserId(Long userId) {
        List<FlashcardItem> items = itemRepo.findByUserId(userId);
        return items.stream()
                .map(itemMapper::entityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void beforeCreate(FlashcardItemRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId != null && request.getUserId() == null) {
            request.setUserId(currentUserId);
        }

        if (request.getDifficulty() == null) {
            request.setDifficulty(0);
        }
        if (request.getSortOrder() == null) {
            int count = itemRepo.countByCategoryId(request.getCategoryId());
            request.setSortOrder(count);
        }
    }

    @Override
    public void afterCreate(FlashcardItem entity, FlashcardItemResponse response, FlashcardItemRequest request) {
        categoryService.updateCardCount(entity.getCategoryId());
        log.info("Created flashcard item in category: {}", entity.getCategoryId());
    }

    @Override
    public void validateBeforeCreate(FlashcardItemRequest request) {
        if (request.getCategoryId() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getFrontContent() == null || request.getFrontContent().isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (request.getBackContent() == null || request.getBackContent().isBlank()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        FlashcardCategory category = categoryRepo.findById(request.getCategoryId()).orElse(null);
        if (category == null) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        }

        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId != null && !currentUserId.equals(category.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public void beforeUpdate(Long id, FlashcardItemRequest request, FlashcardItem existingEntity) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId != null && !currentUserId.equals(existingEntity.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public void beforeDelete(Long id, FlashcardItem existingEntity) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId != null && !currentUserId.equals(existingEntity.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
    }

    @Override
    public void afterDelete(Long id, FlashcardItem deletedEntitySnapshot) {
        categoryService.updateCardCount(deletedEntitySnapshot.getCategoryId());
    }

    @Override
    public void reviewItem(Long itemId, boolean isCorrect) {
        FlashcardItem item = itemRepo.findById(itemId).orElse(null);
        if (item == null) {
            throw new AppException(ErrorCode.ENTITY_NOT_EXISTED);
        }

        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId != null && !currentUserId.equals(item.getUserId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        int reviewCount = item.getReviewCount() == null ? 0 : item.getReviewCount();
        int correctCount = item.getCorrectCount() == null ? 0 : item.getCorrectCount();
        int difficulty = item.getDifficulty() == null ? 0 : item.getDifficulty();

        item.setReviewCount(reviewCount + 1);
        if (isCorrect) {
            item.setCorrectCount(correctCount + 1);
            difficulty = Math.max(0, difficulty - 1);
        } else {
            difficulty = Math.min(5, difficulty + 1);
        }
        item.setDifficulty(difficulty);
        item.setLastReviewedAt(Instant.now());

        int intervalDays = switch (difficulty) {
            case 0 -> 7;
            case 1 -> 3;
            case 2 -> 1;
            default -> 1;
        };
        item.setNextReviewAt(Instant.now().plus(intervalDays, ChronoUnit.DAYS));

        itemRepo.save(item);
        log.info("Reviewed flashcard item: {} isCorrect: {}", itemId, isCorrect);
    }
}
