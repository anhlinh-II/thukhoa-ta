package com.example.quiz.model.entity.user_learning_item;

import com.example.quiz.base.BaseEntity;
import com.example.quiz.enums.LearningType;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_learning_item")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserLearningItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

    @Enumerated(EnumType.STRING)
    private LearningType learningType;
}
