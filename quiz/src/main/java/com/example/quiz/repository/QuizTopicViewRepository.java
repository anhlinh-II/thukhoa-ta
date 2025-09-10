package com.example.quiz.repository;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.view.QuizTopicView;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizTopicViewRepository extends BaseRepository<QuizTopicView, Long> {

    List<QuizTopicView> findByProgramIdAndIsDeletedFalseOrderByDisplayOrder(Long programId);

    List<QuizTopicView> findByQuizGroupIdAndIsDeletedFalseOrderByDisplayOrder(Long quizGroupId);

//     List<QuizTopicView> findByProgramIdAndCategoryAndIsDeletedFalseOrderByDisplayOrder(
//             Long programId, com.example.quiz.model.entity.QuizTopic.TopicCategory category);

//     List<QuizTopicView> findByProgramIdAndCategoryAndLevelAndIsDeletedFalseOrderByDisplayOrder(
//             Long programId, com.example.quiz.model.entity.QuizTopic.TopicCategory category, 
//             com.example.quiz.model.entity.QuizTopic.DifficultyLevel level);

    Optional<QuizTopicView> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizTopicView> findBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qtv FROM QuizTopicView qtv WHERE qtv.programId = :programId " +
           "AND qtv.isDeleted = false AND qtv.isActive = true ORDER BY qtv.displayOrder")
    List<QuizTopicView> findActiveByProgramId(@Param("programId") Long programId);

    @Query("SELECT qtv FROM QuizTopicView qtv WHERE qtv.quizGroupId = :quizGroupId " +
           "AND qtv.isDeleted = false AND qtv.isActive = true ORDER BY qtv.displayOrder")
    List<QuizTopicView> findActiveByQuizGroupId(@Param("quizGroupId") Long quizGroupId);

//     @Query("SELECT qtv FROM QuizTopicView qtv WHERE qtv.programId = :programId " +
//            "AND qtv.category = :category AND qtv.isDeleted = false AND qtv.isActive = true " +
//            "ORDER BY qtv.level, qtv.displayOrder")
//     List<QuizTopicView> findProgressiveLearningPath(@Param("programId") Long programId, 
//                                                     @Param("category") com.example.quiz.model.entity.QuizTopic.TopicCategory category);
}
