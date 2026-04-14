import { ENV } from '@/share/utils/env';
import { BaseService, PagingResponse } from '../BaseService';
import { UserQuizHis, UserQuizHisRequest, UserQuizHisResponse, UserQuizHisView } from './models';



export class UserQuizHistoryService extends BaseService<UserQuizHis, UserQuizHisRequest, UserQuizHisResponse, UserQuizHisView> {
  constructor() {
    super(ENV.API_URL, 'me/quiz-history');
  }

  async listPaged(page = 0, size = 10, quizType?: string): Promise<PagingResponse<UserQuizHisResponse>> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('size', String(size));
    if (quizType) params.append('quizType', quizType);
    const url = `${this.getEndpoint()}?${params.toString()}`;
    return this.handleRequest<PagingResponse<UserQuizHisResponse>>(url);
  }

  async getDetail(id: string | number): Promise<any> {
    // The detailed history (questions + answers) is exposed by the dedicated endpoint
    // `/api/v1/me/quiz-history/{id}` on the backend. Call that explicitly so UI gets the detail payload.
    return this.handleRequest<any>(`${ENV.API_URL}/me/quiz-history/${id}`);
  }
}

export const userQuizHistoryService = new UserQuizHistoryService();
