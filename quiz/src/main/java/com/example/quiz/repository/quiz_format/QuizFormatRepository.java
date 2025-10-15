package com.example.quiz.repository.quiz_format;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.quiz_format.QuizFormat;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizFormatRepository extends BaseRepository<QuizFormat, Long> {

    List<QuizFormat> findByQuizGroupIdAndIsDeletedFalseOrderByDisplayOrder(Long quizGroupId);
    
    List<QuizFormat> findByQuizGroupIdAndIsDeletedFalse(Long quizGroupId);
    
    List<QuizFormat> findByQuizGroupIdAndIsActiveTrueAndIsDeletedFalse(Long quizGroupId);

    Optional<QuizFormat> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizFormat> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT COUNT(qf) FROM QuizFormat qf WHERE qf.quizGroup.id = :quizGroupId " +
           "AND qf.isDeleted = false")
    Long countByQuizGroupId(@Param("quizGroupId") Long quizGroupId);
    
    List<QuizFormat> findByTimeLimitSecondsAndIsDeletedFalse(Integer timeLimitSeconds);
    
}
