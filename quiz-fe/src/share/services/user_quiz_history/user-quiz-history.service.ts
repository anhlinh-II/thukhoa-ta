import { ENV } from '@/share/config/env';
import { BaseService, PagingResponse } from '../BaseService';
import { UserQuizHis, UserQuizHisRequest, UserQuizHisResponse, UserQuizHisView } from './models';



export class UserQuizHistoryService extends BaseService<UserQuizHis, UserQuizHisRequest, UserQuizHisResponse, UserQuizHisView> {
  constructor() {
    super(ENV.API_URL, 'me/quiz-history');
  }

  async listPaged(page = 0, size = 10): Promise<PagingResponse<UserQuizHisResponse>> {
    return this.findAllPaged({ page, size });
  }
}

export const userQuizHistoryService = new UserQuizHistoryService();
