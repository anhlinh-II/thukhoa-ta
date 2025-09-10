package com.example.quiz.repository;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.QuizMockTest;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizMockTestRepository extends BaseRepository<QuizMockTest, Long> {

    List<QuizMockTest> findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(Long programId);

    List<QuizMockTest> findByQuizGroupIdAndIsDeletedFalseOrderByDisplayOrder(Long quizGroupId);
    
    List<QuizMockTest> findByQuizGroupIdAndIsDeletedFalse(Long quizGroupId);
    
    List<QuizMockTest> findByQuizGroupIdAndIsActiveTrueAndIsDeletedFalse(Long quizGroupId);

    Optional<QuizMockTest> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizMockTest> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qmt FROM QuizMockTest qmt WHERE qmt.program.id = :programId " +
           "AND qmt.isDeleted = false AND qmt.isActive = true ORDER BY qmt.displayOrder")
    List<QuizMockTest> findActiveByProgramId(@Param("programId") Long programId);

    @Query("SELECT qmt FROM QuizMockTest qmt WHERE qmt.quizGroup.id = :quizGroupId " +
           "AND qmt.isDeleted = false AND qmt.isActive = true ORDER BY qmt.displayOrder")
    List<QuizMockTest> findActiveByQuizGroupId(@Param("quizGroupId") Long quizGroupId);

    @Query("SELECT qmt FROM QuizMockTest qmt WHERE qmt.program.id = :programId " +
           "AND qmt.durationMinutes <= :maxDuration AND qmt.isDeleted = false " +
           "AND qmt.isActive = true ORDER BY qmt.displayOrder")
    List<QuizMockTest> findByProgramIdAndMaxDuration(@Param("programId") Long programId, 
                                                     @Param("maxDuration") Integer maxDuration);

    @Query("SELECT COUNT(qmt) FROM QuizMockTest qmt WHERE qmt.quizGroup.id = :quizGroupId " +
           "AND qmt.isDeleted = false")
    Long countByQuizGroupId(@Param("quizGroupId") Long quizGroupId);
    
    List<QuizMockTest> findByDurationMinutesAndIsDeletedFalse(Integer durationMinutes);
    
}
