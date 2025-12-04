package com.example.quiz.model.entity.flashcard_category;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlashcardCategoryRequest {
    Long userId;
    String name;
    String description;
    String color;
    String icon;
    Boolean isPublic;
}
