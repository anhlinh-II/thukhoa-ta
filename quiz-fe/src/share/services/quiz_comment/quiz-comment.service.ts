import { ENV } from '@/share/utils/env';
import { BaseService } from '../BaseService';

class QuizCommentService extends BaseService<any, any, any, any> {
  constructor() {
    super(ENV.API_URL, 'quiz-comments');
  }

  async findByQuiz(quizId: number, page = 0, size = 20) {
    const url = `${this.getEndpoint()}/by-quiz/${quizId}?page=${page}&size=${size}`;
    return this.handleRequest<any>(url);
  }

  async create(payload: { quizId: number; parentId?: number; content: string }) {
    return this.handleRequest<any>(`${this.getEndpoint()}/create`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async flag(id: number, reason?: string) {
    return this.handleRequest<any>(`${this.getEndpoint()}/${id}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }
}

export const quizCommentService = new QuizCommentService();
