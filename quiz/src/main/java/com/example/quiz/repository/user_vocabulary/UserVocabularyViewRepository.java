package com.example.quiz.repository.user_vocabulary;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.user_vocabulary.UserVocabularyView;
import org.springframework.stereotype.Repository;

@Repository
public interface UserVocabularyViewRepository extends BaseRepository<UserVocabularyView, Long> {
}
