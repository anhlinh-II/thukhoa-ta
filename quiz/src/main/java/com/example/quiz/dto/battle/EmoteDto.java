package com.example.quiz.dto.battle;

import lombok.Data;

@Data
public class EmoteDto {
    private String emoteKey;
    private String label;
    private Long fromUserId;
    private Long timestamp;
}
