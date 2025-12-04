package com.example.quiz.dto.battle;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BattleResultDto {
    private List<TeamResultDto> teams;
    private List<BattleParticipantDto> participants;
}
