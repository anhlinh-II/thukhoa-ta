package com.example.quiz.model.entity.flashcard_item;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlashcardItemRequest {
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
    Integer sortOrder;
}
