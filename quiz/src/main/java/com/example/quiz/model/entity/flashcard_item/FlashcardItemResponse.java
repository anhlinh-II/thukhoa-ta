package com.example.quiz.model.entity.flashcard_item;

import com.example.quiz.base.impl.BaseResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlashcardItemResponse extends BaseResponse {
    Long categoryId;
    Long userId;
    String frontContent;
    String backContent;
    String example;
    String frontImage;
    String backImage;
    String audioUrl;
    String tags;
    Integer difficulty;
    Integer reviewCount;
    Integer correctCount;
    Instant lastReviewedAt;
    Instant nextReviewAt;
    Integer sortOrder;
    String categoryName;
}
