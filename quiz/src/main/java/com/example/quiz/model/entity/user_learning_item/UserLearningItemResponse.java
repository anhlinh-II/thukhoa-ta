package com.example.quiz.model.entity.user_learning_item;

import com.example.quiz.base.impl.BaseResponse;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
public class UserLearningItemResponse extends BaseResponse {
    private Long userId;

    private Long questionId;

    private Double ef;

    private Integer repetitions;

    private Integer intervalDays;

    private Instant nextReviewAt;

    private Instant lastReviewedAt;

    private Integer lapses;

    private Integer consecutiveFails;

    private Double priority;
}
