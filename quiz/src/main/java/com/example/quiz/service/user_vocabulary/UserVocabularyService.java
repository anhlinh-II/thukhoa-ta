package com.example.quiz.service.user_vocabulary;

import com.example.quiz.base.baseInterface.BaseService;
import com.example.quiz.model.dto.vocab.ReviewQuestionDto;
import com.example.quiz.model.entity.user_vocabulary.UserVocabulary;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyRequest;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyResponse;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyView;
import com.fasterxml.jackson.core.JsonProcessingException;

public interface UserVocabularyService extends BaseService<UserVocabulary, Long, UserVocabularyRequest, UserVocabularyResponse, UserVocabularyView> {
    ReviewQuestionDto buildQuestionForUser(Long userId, Integer optionsCount, Long vocabIdOpt) throws JsonProcessingException;
    java.util.List<ReviewQuestionDto> buildQuestionsForUser(Long userId, Integer optionsCount, Integer questionsCount) throws JsonProcessingException;
    UserVocabulary reviewVocabulary(Long vocabId, Long userId, Double quality); // Added reviewVocabulary signature
}
