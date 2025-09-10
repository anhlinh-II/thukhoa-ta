package com.example.quiz.repository;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.QuizTopic;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizTopicRepository extends BaseRepository<QuizTopic, Long> {

    List<QuizTopic> findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(Long programId);

    List<QuizTopic> findByQuizGroupIdAndIsDeletedFalseOrderByDisplayOrder(Long quizGroupId);
    
    List<QuizTopic> findByQuizGroupIdAndIsDeletedFalse(Long quizGroupId);

    List<QuizTopic> findByQuizGroupIdAndIsActiveTrueAndIsDeletedFalse(Long quizGroupId);

    Optional<QuizTopic> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizTopic> findBySlugAndIsDeletedFalse(String slug);

    boolean existsBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qt FROM QuizTopic qt WHERE qt.program.id = :programId " +
           "AND qt.isDeleted = false AND qt.isActive = true ORDER BY qt.displayOrder")
    List<QuizTopic> findActiveByProgramId(@Param("programId") Long programId);

    @Query("SELECT qt FROM QuizTopic qt WHERE qt.quizGroup.id = :quizGroupId " +
           "AND qt.isDeleted = false AND qt.isActive = true ORDER BY qt.displayOrder")
    List<QuizTopic> findActiveByQuizGroupId(@Param("quizGroupId") Long quizGroupId);

    @Query("SELECT COUNT(qt) FROM QuizTopic qt WHERE qt.quizGroup.id = :quizGroupId " +
           "AND qt.isDeleted = false")
    Long countByQuizGroupId(@Param("quizGroupId") Long quizGroupId);
    
    @Query("SELECT qt FROM QuizTopic qt WHERE qt.prerequisiteTopics LIKE %:topicId% " +
           "AND qt.isDeleted = false")
    List<QuizTopic> findByPrerequisiteTopicIdAndIsDeletedFalse(@Param("topicId") String topicId);
}
