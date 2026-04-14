import { ENV } from '@/share/utils/env';
import { BaseService } from '../BaseService';
import { QuizGroup, QuizGroupRequest, QuizGroupResponse, QuizGroupView } from './models';

// Quiz Group Service
export class QuizGroupService extends BaseService<
  QuizGroup,
  QuizGroupRequest,
  QuizGroupResponse,
  QuizGroupView
> {
  constructor() {
  super(ENV.API_URL, 'quiz-groups');
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
