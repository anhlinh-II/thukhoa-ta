package com.example.quiz.model.entity.flashcard_category;

import com.example.quiz.base.impl.BaseResponse;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FlashcardCategoryResponse extends BaseResponse {
    Long userId;
    String name;
    String description;
    String color;
    String icon;
    Integer cardCount;
    Boolean isPublic;
}
