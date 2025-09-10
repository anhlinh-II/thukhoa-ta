package com.example.quiz.repository;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.view.QuizMockTestView;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizMockTestViewRepository extends BaseRepository<QuizMockTestView, Long> {

    List<QuizMockTestView> findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(Long programId);

    List<QuizMockTestView> findByQuizGroupIdAndIsDeletedFalseOrderByDisplayOrder(Long quizGroupId);

    Optional<QuizMockTestView> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizMockTestView> findBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qmtv FROM QuizMockTestView qmtv WHERE qmtv.programId = :programId " +
           "AND qmtv.isDeleted = false AND qmtv.isActive = true ORDER BY qmtv.displayOrder")
    List<QuizMockTestView> findActiveByProgramId(@Param("programId") Long programId);

    @Query("SELECT qmtv FROM QuizMockTestView qmtv WHERE qmtv.quizGroupId = :quizGroupId " +
           "AND qmtv.isDeleted = false AND qmtv.isActive = true ORDER BY qmtv.displayOrder")
    List<QuizMockTestView> findActiveByQuizGroupId(@Param("quizGroupId") Long quizGroupId);

    @Query("SELECT qmtv FROM QuizMockTestView qmtv WHERE qmtv.programId = :programId " +
           "AND qmtv.durationMinutes <= :maxDuration AND qmtv.isDeleted = false " +
           "AND qmtv.isActive = true ORDER BY qmtv.displayOrder")
    List<QuizMockTestView> findByProgramIdAndMaxDuration(@Param("programId") Long programId, 
                                                         @Param("maxDuration") Integer maxDuration);
}
