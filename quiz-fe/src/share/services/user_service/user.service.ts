import { BaseService } from "../BaseService";
import { ENV } from '../../utils/env';
import { User, UserRequest, UserView } from "./models";
import { UserResponse } from "../authService";
import apiClient from "../api";

export interface LeaderboardUser {
     rank: number;
     id: number;
     username: string;
     fullName: string;
     avatarUrl?: string;
     rankingPoints: number;
     totalQuizzesCompleted: number;
     currentStreak: number;
     averageAccuracy: number;
}

export interface LeaderboardResponse {
     users: LeaderboardUser[];
     totalUsers: number;
     currentUserRank?: number;
     currentUser?: LeaderboardUser;
}

export class UserService extends BaseService<
User,
UserRequest,
UserResponse,
UserView
> {
     constructor() {
          super(ENV.API_URL, 'users');
     }

     async getLeaderboard(page: number = 0, size: number = 50): Promise<LeaderboardResponse> {
          const response = await apiClient.get(`/users/leaderboard?page=${page}&size=${size}`);
          return response.data.result;
     }
}

export const userService = new UserService();