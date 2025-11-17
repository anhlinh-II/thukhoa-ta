package com.example.quiz.model.entity.user_learning_item;

import com.example.quiz.base.BaseView;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.Subselect;

import java.time.Instant;

@Immutable
@Entity
@Subselect("""
    select * from user_learning_item_view
""")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserLearningItemView extends BaseView {
    @Id
    Long id;

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
