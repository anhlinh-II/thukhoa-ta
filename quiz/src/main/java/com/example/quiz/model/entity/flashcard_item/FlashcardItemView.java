package com.example.quiz.model.entity.flashcard_item;

import com.example.quiz.base.BaseView;
import jakarta.persistence.Column;
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
    SELECT * FROM flashcard_item_view
""")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FlashcardItemView extends BaseView {
    @Id
    private Long id;

    @Column(name = "category_id")
    private Long categoryId;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "front_content")
    private String frontContent;

    @Column(name = "back_content")
    private String backContent;

    @Column(name = "example")
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

    @Column(name = "category_name")
    private String categoryName;
}
