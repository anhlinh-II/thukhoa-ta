package com.example.quiz.dto.battle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamResultDto {
    private Integer teamId;
    private Integer totalScore;
    private List<BattleParticipantDto> participants;
}
