package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.flashcard_item.FlashcardItem;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemRequest;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemResponse;
import com.example.quiz.model.entity.flashcard_item.FlashcardItemView;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FlashcardItemMapper extends BaseMapstruct<FlashcardItem, FlashcardItemRequest, FlashcardItemResponse, FlashcardItemView> {
}
