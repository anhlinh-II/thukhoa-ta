package com.example.quiz.controller;

import com.example.quiz.dto.battle.*;
import com.example.quiz.service.BattleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
@Slf4j
public class BattleWebSocketController {
    
    private final BattleService battleService;
    
    @MessageMapping("/battle/join")
    public void joinBattle(@Payload JoinBattleRequest request, SimpMessageHeaderAccessor headerAccessor) {
        // Extract IP from WebSocket session if not provided
        if (request.getIpAddress() == null) {
            request.setIpAddress(getClientIp(headerAccessor));
        }
        
        battleService.joinBattle(request);
    }
    
    @MessageMapping("/battle/{battleId}/ready")
    public void setReady(@DestinationVariable Long battleId, @Payload Map<String, Object> payload) {
        Long userId = ((Number) payload.get("userId")).longValue();
        Boolean ready = (Boolean) payload.getOrDefault("ready", true);
        
        battleService.setReady(battleId, userId, ready);
    }
    
    @MessageMapping("/battle/answer")
    public void submitAnswer(@Payload SubmitAnswerRequest request) {
        battleService.submitAnswer(request);
    }
    
    @MessageMapping("/battle/{battleId}/tab-switch")
    public void reportTabSwitch(@DestinationVariable Long battleId, @Payload Map<String, Object> payload) {
        Long userId = ((Number) payload.get("userId")).longValue();
        battleService.reportTabSwitch(battleId, userId);
    }
    
    @MessageMapping("/battle/{battleId}/complete")
    public void completeBattle(@DestinationVariable Long battleId, @Payload Map<String, Object> payload) {
        Long userId = ((Number) payload.get("userId")).longValue();
        battleService.completeBattle(battleId, userId);
    }

    @MessageMapping("/battle/{battleId}/emote")
    public void sendEmote(@DestinationVariable Long battleId, @Payload EmoteDto emote) {
        // Broadcast received emote to topic so other subscribers get it
        battleService.broadcastEmote(battleId, emote);
    }
    
    private String getClientIp(SimpMessageHeaderAccessor headerAccessor) {
        // Try to get real IP from headers
        Object nativeHeaders = headerAccessor.getSessionAttributes().get("nativeHeaders");
        // Fallback to session remote address
        return "unknown";
    }
}
