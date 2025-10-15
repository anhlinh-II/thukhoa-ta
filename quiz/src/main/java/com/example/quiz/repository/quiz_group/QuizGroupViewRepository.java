package com.example.quiz.repository.quiz_group;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.quiz_group.QuizGroupView;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizGroupViewRepository extends BaseRepository<QuizGroupView, Long> {

    List<QuizGroupView> findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(Long programId);

    List<QuizGroupView> findByProgramIdAndGroupTypeAndIsDeletedFalseOrderByDisplayOrder(
            Long programId, QuizGroupView.GroupType groupType);

    Optional<QuizGroupView> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizGroupView> findBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qgv FROM QuizGroupView qgv WHERE qgv.programId = :programId " +
           "AND qgv.isDeleted = false AND qgv.isActive = true ORDER BY qgv.displayOrder")
    List<QuizGroupView> findActiveByProgramId(@Param("programId") Long programId);
}
