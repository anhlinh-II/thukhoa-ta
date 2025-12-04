package com.example.quiz.dto.battle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleParticipantDto {
    private Long id;
    private Long userId;
    private String userName;
    private Integer teamId;
    private Integer score;
    private Boolean isReady;
    private Boolean isCompleted;
    private Integer tabSwitchCount;
    private Boolean isSuspicious;
    private Long battleId;
    private String avatarUrl;
}
