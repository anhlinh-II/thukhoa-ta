package com.example.quiz.dto.battle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinBattleRequest {
    private Long battleId;
    private Long userId;
    private Integer teamId;
    private String ipAddress;
    private String userAgent;
    private String inviteCode;
}
