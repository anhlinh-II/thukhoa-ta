import { BaseService } from './BaseService';

// Quiz Group Types
export interface QuizGroup {
  id: number;
  name: string;
  description?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizGroupRequest {
  name: string;
  description?: string;
}

export interface QuizGroupResponse extends QuizGroup {}

export interface QuizGroupView extends QuizGroup {
  totalQuizzes?: number;
  activeQuizzes?: number;
}

// Quiz Group Service
export class QuizGroupService extends BaseService<
  QuizGroup,
  QuizGroupRequest,
  QuizGroupResponse,
  QuizGroupView
> {
  constructor() {
  super('http://localhost:8080/api/v1', 'quiz-groups');
  }

  // Custom methods specific to QuizGroup
  async findActiveGroups(): Promise<QuizGroupResponse[]> {
    return this.handleRequest<QuizGroupResponse[]>(`${this.getEndpoint()}/active`);
  }

  async toggleStatus(id: number): Promise<QuizGroupResponse> {
    return this.handleRequest<QuizGroupResponse>(`${this.getEndpoint()}/${id}/toggle-status`, {
      method: 'PUT',
    });
  }
}

// Create singleton instance
export const quizGroupService = new QuizGroupService();
