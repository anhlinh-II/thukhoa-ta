export enum BattleMode {
  SOLO_1V1 = 'SOLO_1V1',
  TEAM_2V2 = 'TEAM_2V2',
}

export enum BattleStatus {
  WAITING = 'WAITING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface BattleParticipant {
  id: number;
  userId: number;
  userName?: string;
  avatarUrl?: string;
  teamId?: number;
  score: number;
  isReady: boolean;
  isCompleted: boolean;
  tabSwitchCount: number;
  isSuspicious: boolean;
}

export interface BattleState {
  battleId: number;
  status: BattleStatus;
  startedAt?: string;
  participants: BattleParticipant[];
  countdown?: number;
  leaderId?: number;
  quizName?: string;
}

export interface SubmitAnswerRequest {
  battleId: number;
  userId: number;
  questionId: number;
  answer: string;
  timestamp: number;
  timeTaken: number;
}
