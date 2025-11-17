package com.example.quiz.service.user_learning_item;

import com.example.quiz.base.impl.AdvancedFilterService;
import com.example.quiz.base.impl.BaseServiceImpl;
import com.example.quiz.mapper.UserLearningItemMapper;
import com.example.quiz.model.entity.user_learning_item.UserLearningItem;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemRequest;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemResponse;
import com.example.quiz.model.entity.user_learning_item.UserLearningItemView;
import com.example.quiz.repository.user_learning_item.UserLearningItemRepository;
import com.example.quiz.repository.user_learning_item.UserLearningItemViewRepository;
import org.springframework.stereotype.Service;
import com.example.quiz.service.user_learning_item.Sm2Service;
import com.example.quiz.enums.LearningType;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserLearningItemServiceImpl extends BaseServiceImpl<UserLearningItem, Long, UserLearningItemRequest, UserLearningItemResponse, UserLearningItemView> implements UserLearningItemService {
    private final UserLearningItemRepository questionRepository;
    private final UserLearningItemViewRepository questionViewRepository;
    private final UserLearningItemMapper questionMapper;
    private final Sm2Service sm2Service;
    

    public UserLearningItemServiceImpl(
            AdvancedFilterService advancedFilterService,
            UserLearningItemRepository questionRepository,
            UserLearningItemMapper questionMapper,
            UserLearningItemViewRepository questionViewRepository,
            Sm2Service sm2Service) {
        super(advancedFilterService, questionRepository, questionMapper, questionViewRepository);
        this.questionRepository = questionRepository;
        this.questionViewRepository = questionViewRepository;
        this.questionMapper = questionMapper;
        this.sm2Service = sm2Service;
    }

    @Override
    protected Class<UserLearningItemView> getViewClass() {
        return UserLearningItemView.class;
    }

    @Override
    public java.util.List<UserLearningItemResponse> getDueItems(Long userId, LearningType learningType) {
        java.util.List<UserLearningItem> items = questionRepository.findAllByUserIdAndLearningTypeAndNextReviewAtBefore(userId, learningType, java.time.Instant.now());
        return items.stream().map(questionMapper::entityToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void afterCreate(UserLearningItem entity, UserLearningItemResponse response, UserLearningItemRequest request) {
        // Ensure SM-2 defaults are present for items created through the generic create path
        boolean changed = false;
        if (entity.getEf() == null) {
            entity.setEf(2.5);
            changed = true;
        }
        if (entity.getRepetitions() == null) {
            entity.setRepetitions(0);
            changed = true;
        }
        if (entity.getIntervalDays() == null) {
            entity.setIntervalDays(1);
            changed = true;
        }
        if (entity.getNextReviewAt() == null) {
            entity.setNextReviewAt(java.time.Instant.now());
            changed = true;
        }
        if (entity.getLapses() == null) {
            entity.setLapses(0);
            changed = true;
        }
        if (entity.getConsecutiveFails() == null) {
            entity.setConsecutiveFails(0);
            changed = true;
        }
        if (entity.getPriority() == null) {
            entity.setPriority(1.0 / Math.max(1, entity.getIntervalDays()));
            changed = true;
        }

        if (changed) {
            questionRepository.save(entity);
        }
    }

    @Override
    public UserLearningItemResponse updateReview(Long id, int quality) {
        UserLearningItem item = questionRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("UserLearningItem not found: " + id));
        UserLearningItem updated = sm2Service.updateOnReview(item, quality);
        return questionMapper.entityToResponse(updated);
    }
}