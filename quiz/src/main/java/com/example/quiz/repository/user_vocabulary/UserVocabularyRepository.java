package com.example.quiz.repository.user_vocabulary;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.user_vocabulary.UserVocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVocabularyRepository extends BaseRepository<UserVocabulary, Long> {
    List<UserVocabulary> findByUserId(Long userId);
    boolean existsByUserIdAndWordAndLanguage(Long userId, String word, String language);
    Optional<UserVocabulary> findFirstByUserIdAndWordAndLanguage(Long userId, String word, String language);
}
