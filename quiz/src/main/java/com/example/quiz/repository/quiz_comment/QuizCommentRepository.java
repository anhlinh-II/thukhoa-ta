package com.example.quiz.repository.quiz_comment;

import com.example.quiz.base.baseInterface.BaseRepository;
import com.example.quiz.model.entity.quiz_comment.QuizComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

@Repository
public interface QuizCommentRepository extends BaseRepository<QuizComment, Long> {
    Page<QuizComment> findByQuizIdAndIsDeletedFalse(Long quizId, Pageable pageable);
    Page<QuizComment> findByParentIdAndIsDeletedFalse(Long parentId, Pageable pageable);
}
