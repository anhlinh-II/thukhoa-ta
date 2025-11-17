package com.example.quiz.model.entity.user_learning_item;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class UserLearningItemRequest {
    Long id;

    Long userId;

    Long questionId;

    Double ef;

    Integer repetitions;

    Integer intervalDays;

    Instant nextReviewAt;

    Instant lastReviewedAt;

    Integer lapses;

    Integer consecutiveFails;

    Double priority;
}
