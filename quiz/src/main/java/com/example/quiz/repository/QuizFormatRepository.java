package com.example.quiz.repository;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.QuizFormat;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizFormatRepository extends BaseRepository<QuizFormat, Long> {

    List<QuizFormat> findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(Long programId);

    List<QuizFormat> findByQuizGroupIdAndIsDeletedFalseOrderByDisplayOrder(Long quizGroupId);
    
    List<QuizFormat> findByQuizGroupIdAndIsDeletedFalse(Long quizGroupId);
    
    List<QuizFormat> findByQuizGroupIdAndIsActiveTrueAndIsDeletedFalse(Long quizGroupId);

    Optional<QuizFormat> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizFormat> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qf FROM QuizFormat qf WHERE qf.program.id = :programId " +
           "AND qf.isDeleted = false AND qf.isActive = true ORDER BY qf.displayOrder")
    List<QuizFormat> findActiveByProgramId(@Param("programId") Long programId);

    @Query("SELECT qf FROM QuizFormat qf WHERE qf.quizGroup.id = :quizGroupId " +
           "AND qf.isDeleted = false AND qf.isActive = true ORDER BY qf.displayOrder")
    List<QuizFormat> findActiveByQuizGroupId(@Param("quizGroupId") Long quizGroupId);

    @Query("SELECT COUNT(qf) FROM QuizFormat qf WHERE qf.quizGroup.id = :quizGroupId " +
           "AND qf.isDeleted = false")
    Long countByQuizGroupId(@Param("quizGroupId") Long quizGroupId);
    
    List<QuizFormat> findByTimeLimitSecondsAndIsDeletedFalse(Integer timeLimitSeconds);
    
}
