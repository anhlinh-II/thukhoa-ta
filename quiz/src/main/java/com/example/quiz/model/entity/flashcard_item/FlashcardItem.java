package com.example.quiz.model.entity.flashcard_item;

import com.example.quiz.base.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Entity
@Table(name = "flashcard_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class FlashcardItem extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "front_content", nullable = false, columnDefinition = "TEXT")
    private String frontContent;

    @Column(name = "back_content", nullable = false, columnDefinition = "TEXT")
    private String backContent;

    @Column(name = "example", columnDefinition = "TEXT")
    private String example;

    @Column(name = "front_image")
    private String frontImage;

    @Column(name = "back_image")
    private String backImage;

    @Column(name = "audio_url")
    private String audioUrl;

    @Column(name = "tags")
    private String tags;

    @Column(name = "difficulty")
    private Integer difficulty;

    @Column(name = "review_count")
    private Integer reviewCount;

    @Column(name = "correct_count")
    private Integer correctCount;

    @Column(name = "last_reviewed_at")
    private Instant lastReviewedAt;

    @Column(name = "next_review_at")
    private Instant nextReviewAt;

    @Column(name = "sort_order")
    private Integer sortOrder;
}
