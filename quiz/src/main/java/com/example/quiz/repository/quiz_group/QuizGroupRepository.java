package com.example.quiz.repository.quiz_group;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.quiz_group.QuizGroup;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizGroupRepository extends BaseRepository<QuizGroup, Long> {

    List<QuizGroup> findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(Long programId);

    List<QuizGroup> findByProgramIdAndGroupTypeAndIsDeletedFalseOrderByDisplayOrder(
            Long programId, QuizGroup.GroupType groupType);

    Optional<QuizGroup> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizGroup> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qg FROM QuizGroup qg WHERE qg.program.id = :programId " +
           "AND qg.isDeleted = false AND qg.isActive = true ORDER BY qg.displayOrder")
    List<QuizGroup> findActiveByProgramId(@Param("programId") Long programId);

    @Query("SELECT COUNT(qg) FROM QuizGroup qg WHERE qg.program.id = :programId " +
           "AND qg.groupType = :groupType AND qg.isDeleted = false")
    Long countByProgramIdAndGroupType(@Param("programId") Long programId, 
                                      @Param("groupType") QuizGroup.GroupType groupType);
}
