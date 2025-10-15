package com.example.quiz.repository.quiz_topic;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.quiz_topic.QuizTopicView;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizTopicViewRepository extends BaseRepository<QuizTopicView, Long> {

    List<QuizTopicView> findByQuizGroupIdAndIsDeletedFalseOrderByDisplayOrder(Long quizGroupId);

    Optional<QuizTopicView> findByIdAndIsDeletedFalse(Long id);

    Optional<QuizTopicView> findBySlugAndIsDeletedFalse(String slug);

    @Query("SELECT qtv FROM QuizTopicView qtv WHERE qtv.quizGroupId = :quizGroupId " +
           "AND qtv.isDeleted = false AND qtv.isActive = true ORDER BY qtv.displayOrder")
    List<QuizTopicView> findActiveByQuizGroupId(@Param("quizGroupId") Long quizGroupId);
}
