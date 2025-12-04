package com.example.quiz.repository;

import com.example.quiz.enums.BattleStatus;
import com.example.quiz.model.QuizBattle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizBattleRepository extends JpaRepository<QuizBattle, Long> {
    
    List<QuizBattle> findByStatus(BattleStatus status);
    
    List<QuizBattle> findByQuizIdAndStatus(Long quizId, BattleStatus status);
    
    @Query("SELECT b FROM QuizBattle b WHERE b.quizId = :quizId AND b.status = :status AND b.createdAt > :after")
    List<QuizBattle> findRecentBattles(@Param("quizId") Long quizId, 
                                       @Param("status") BattleStatus status, 
                                       @Param("after") LocalDateTime after);
    
    @Query("SELECT DISTINCT b FROM QuizBattle b LEFT JOIN FETCH b.participants WHERE b.id = :id")
    Optional<QuizBattle> findByIdWithParticipants(@Param("id") Long id);

    Optional<QuizBattle> findByInviteCode(String inviteCode);

    @Query("SELECT DISTINCT b FROM QuizBattle b LEFT JOIN FETCH b.participants WHERE b.inviteCode = :inviteCode")
    Optional<QuizBattle> findByInviteCodeWithParticipants(@Param("inviteCode") String inviteCode);
}
