package com.example.quiz.repository;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.view.QuizFormatView;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizFormatViewRepository extends BaseRepository<QuizFormatView, Long> {

    List<QuizFormatView> findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(Long programId);

    List<QuizFormatView> findByQuizGroupIdAndIsDeletedFalseOrderByDisplayOrder(Long quizGroupId);

    Optional<QuizFormatView> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizFormatView> findBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qfv FROM QuizFormatView qfv WHERE qfv.programId = :programId " +
           "AND qfv.isDeleted = false AND qfv.isActive = true ORDER BY qfv.displayOrder")
    List<QuizFormatView> findActiveByProgramId(@Param("programId") Long programId);

    @Query("SELECT qfv FROM QuizFormatView qfv WHERE qfv.quizGroupId = :quizGroupId " +
           "AND qfv.isDeleted = false AND qfv.isActive = true ORDER BY qfv.displayOrder")
    List<QuizFormatView> findActiveByQuizGroupId(@Param("quizGroupId") Long quizGroupId);
}
