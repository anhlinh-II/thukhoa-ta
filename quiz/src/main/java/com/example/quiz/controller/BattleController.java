package com.example.quiz.controller;

import com.example.quiz.dto.battle.BattleParticipantDto;
import com.example.quiz.dto.battle.BattleResultDto;
import com.example.quiz.dto.battle.CreateBattleRequest;
import com.example.quiz.dto.battle.JoinBattleRequest;
import com.example.quiz.model.QuizBattle;
import com.example.quiz.model.dto.response.ApiResponse;
import com.example.quiz.exception.AppException;
import com.example.quiz.exception.ErrorCode;
import com.example.quiz.service.BattleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/battles")
@RequiredArgsConstructor
public class BattleController {

    private final BattleService battleService;

    @PostMapping
    public ApiResponse<QuizBattle> createBattle(@RequestBody CreateBattleRequest request) {
        QuizBattle battle = battleService.createBattle(request);
        return ApiResponse.successOf(battle);
    }

    @GetMapping("/quiz/{quizId}/waiting")
    public ApiResponse<List<QuizBattle>> getWaitingBattles(@PathVariable Long quizId) {
        List<QuizBattle> battles = battleService.getWaitingBattles(quizId);
        return ApiResponse.successOf(battles);
    }

    @GetMapping("/{battleId}")
    public ApiResponse<QuizBattle> getBattle(@PathVariable Long battleId) {
        QuizBattle battle = battleService.getBattle(battleId);
        return ApiResponse.successOf(battle);
    }

    @GetMapping("/{battleId}/results")
    public ApiResponse<BattleResultDto> getBattleResults(@PathVariable Long battleId) {
        BattleResultDto results = battleService.getBattleResults(battleId);
        return ApiResponse.successOf(results);
    }

    @PostMapping("/{battleId}/join")
    public ApiResponse<BattleParticipantDto> joinBattle(@PathVariable Long battleId,
            @RequestBody JoinBattleRequest request) {
        // ensure path id matches request.battleId if provided
        request.setBattleId(battleId);
        BattleParticipantDto participant = battleService.joinBattle(request);
        return ApiResponse.successOf(participant);
    }

    @PostMapping("/{battleId}/disband")
    public ApiResponse<Void> disbandBattle(@PathVariable Long battleId,
            @RequestParam(required = false) Long userId,
            @RequestBody(required = false) java.util.Map<String, Object> body) {
        Long uid = userId;
        if (uid == null && body != null && body.get("userId") != null) {
            uid = ((Number) body.get("userId")).longValue();
        }
        if (uid == null) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        battleService.disbandBattle(battleId, uid);
        return ApiResponse.successOf(null);
    }

    @PostMapping("/join-by-code")
    public ApiResponse<BattleParticipantDto> joinBattleByCode(@RequestBody JoinBattleRequest request) {
        if (request.getInviteCode() == null || request.getInviteCode().trim().isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        BattleParticipantDto participant = battleService.joinBattleByCode(request.getInviteCode(), request);
        return ApiResponse.successOf(participant);
    }

    @GetMapping("/{battleId}/participants")
    public ApiResponse<List<BattleParticipantDto>> getParticipants(@PathVariable Long battleId) {
        List<BattleParticipantDto> participants = battleService.getParticipants(battleId);
        return ApiResponse.successOf(participants);
    }

    @DeleteMapping("/{battleId}/participants/{userId}")
    public ApiResponse<Void> removeParticipant(@PathVariable Long battleId, @PathVariable Long userId) {
        battleService.removeParticipant(battleId, userId);
        return ApiResponse.successOf(null);
    }
}
