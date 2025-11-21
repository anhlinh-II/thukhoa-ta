package com.example.quiz.repository.vocab;

import com.example.quiz.model.entity.vocab.UserVocabulary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserVocabularyRepository extends JpaRepository<UserVocabulary, Long> {
    List<UserVocabulary> findByUserId(Long userId);
}
