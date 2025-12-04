package com.example.quiz.dto.battle;

import com.example.quiz.enums.BattleStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleStateDto {
    private Long battleId;
    private BattleStatus status;
    private LocalDateTime startedAt;
    private Long leaderId;
    private List<BattleParticipantDto> participants;
    private Integer countdown;
}
