import { BattleMode, BattleStatus } from './battle.types';
import apiClient from './api';

// Generic API response wrapper used by the backend
interface ApiResponse<T> {
  code?: number;
  message?: string;
  result?: T;
}

export interface CreateBattleRequest {
  quizId: number;
  battleMode: BattleMode;
  leaderId?: number;
}

export interface QuizBattle {
  id: number;
  quizId: number;
  quizName?: string;
  battleMode: BattleMode;
  status: BattleStatus;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  leaderId?: number;
  inviteCode?: string;
}

export interface BattleParticipantResp {
  id: number;
  userId: number;
  userName?: string;
  teamId?: number;
  score: number;
  isReady: boolean;
  isCompleted: boolean;
  tabSwitchCount: number;
  isSuspicious: boolean;
  battleId: number;
  avatarUrl?: string;
}

export interface TeamResultResp {
  teamId: number;
  totalScore: number;
  participants: BattleParticipantResp[];
}

export interface BattleResultResp {
  teams: TeamResultResp[];
  participants: BattleParticipantResp[];
}

const unwrapResult = <T,>(resp: any): T => {
  if (!resp) return resp;
  const data = resp.data ?? resp;
  if (data && typeof data === 'object') {
    if (Array.isArray(data)) return data as unknown as T;
    if (data.result !== undefined) return data.result as T;
    if (data.data !== undefined) return data.data as T;
  }
  return data as T;
};

export const battleService = {
  async createBattle(request: CreateBattleRequest): Promise<QuizBattle> {
    const resp = await apiClient.post('/battles', request);
    return unwrapResult<QuizBattle>(resp);
  },

  async disbandBattle(battleId: number, userId: number) {
    const resp = await apiClient.post(`/battles/${battleId}/disband?userId=${userId}`, { userId });
    return unwrapResult<any>(resp);
  },

  async getWaitingBattles(quizId: number): Promise<QuizBattle[]> {
    const resp = await apiClient.get(`/battles/quiz/${quizId}/waiting`);
    return unwrapResult<QuizBattle[]>(resp) ?? [];
  },

  async getBattle(battleId: number): Promise<QuizBattle> {
    const resp = await apiClient.get(`/battles/${battleId}`);
    return unwrapResult<QuizBattle>(resp);
  },

  async joinBattle(battleId: number, payload: { userId: number; teamId?: number; ipAddress?: string; userAgent?: string }) {
    const resp = await apiClient.post(`/battles/${battleId}/join`, { ...payload });
    return unwrapResult<BattleParticipantResp>(resp);
  },

  async joinBattleByCode(inviteCode: string, payload: { userId: number; teamId?: number; ipAddress?: string; userAgent?: string }): Promise<ApiResponse<BattleParticipantResp>> {
    const resp = await apiClient.post(`/battles/join-by-code`, { ...payload, inviteCode });
    // return the full ApiResponse so callers can inspect code/message
    const data = resp.data ?? resp;
    return data as ApiResponse<BattleParticipantResp>;
  },

  async removeParticipant(battleId: number, userId: number) {
    const resp = await apiClient.delete(`/battles/${battleId}/participants/${userId}`);
    return unwrapResult<any>(resp);
  },

  async getParticipants(battleId: number): Promise<BattleParticipantResp[]> {
    const resp = await apiClient.get(`/battles/${battleId}/participants`);
    return unwrapResult<BattleParticipantResp[]>(resp) ?? [];
  },

  async getQuizPreview(quizId: number): Promise<any> {
    const resp = await apiClient.get(`/quiz-mock-tests/${quizId}/preview`);
    return unwrapResult<any>(resp) ?? null;
  },

  async getResults(battleId: number): Promise<BattleResultResp | null> {
    const resp = await apiClient.get(`/battles/${battleId}/results`);
    return unwrapResult<BattleResultResp>(resp) ?? null;
  },
};
