package com.example.quiz.mapper;

import com.example.quiz.base.baseInterface.BaseMapstruct;
import com.example.quiz.model.entity.user_vocabulary.UserVocabulary;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyRequest;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyResponse;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyView;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserVocabularyMapper extends BaseMapstruct<UserVocabulary, UserVocabularyRequest, UserVocabularyResponse, UserVocabularyView> {
}
