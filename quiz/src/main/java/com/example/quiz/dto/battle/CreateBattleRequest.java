package com.example.quiz.dto.battle;

import com.example.quiz.enums.BattleMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBattleRequest {
    private Long quizId;
    private BattleMode battleMode;
    private Long leaderId;
}
