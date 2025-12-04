package com.example.quiz.repository;

import com.example.quiz.model.BattleParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BattleParticipantRepository extends JpaRepository<BattleParticipant, Long> {
    
    List<BattleParticipant> findByBattleId(Long battleId);
    
    Optional<BattleParticipant> findByBattleIdAndUserId(Long battleId, Long userId);

    List<BattleParticipant> findAllByBattleIdAndUserId(Long battleId, Long userId);
    
    @Query("SELECT COUNT(p) FROM BattleParticipant p WHERE p.battle.id = :battleId")
    int countByBattleId(@Param("battleId") Long battleId);
    
    @Query("SELECT p FROM BattleParticipant p WHERE p.battle.id = :battleId AND p.ipAddress = :ip")
    List<BattleParticipant> findByBattleIdAndIpAddress(@Param("battleId") Long battleId, @Param("ip") String ip);
    
    @Query("SELECT p FROM BattleParticipant p WHERE p.battle.id = :battleId ORDER BY p.score DESC, p.completedAt ASC")
    List<BattleParticipant> findLeaderboard(@Param("battleId") Long battleId);
}
