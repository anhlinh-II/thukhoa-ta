package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardUserDto {
    private Integer rank;
    private Long id;
    private String username;
    private String fullName;
    private String avatarUrl;
    private Long rankingPoints;
    private Integer totalQuizzesCompleted;
    private Integer currentStreak;
    private Double averageAccuracy;
}
