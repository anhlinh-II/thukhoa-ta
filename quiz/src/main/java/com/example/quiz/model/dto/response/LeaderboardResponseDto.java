package com.example.quiz.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardResponseDto {
    private List<LeaderboardUserDto> users;
    private Long totalUsers;
    private Integer currentUserRank;
    private LeaderboardUserDto currentUser;
}
