import { ENV } from '@/share/utils/env';
import { BaseService, PagingResponse } from '../BaseService';
import {
  UserQuestionAnswer,
  UserQuestionAnswerRequest,
  UserQuestionAnswerResponse,
  UserQuestionAnswerView,
} from './models';


export class UserQuestionAnswerService extends BaseService<UserQuestionAnswer, UserQuestionAnswerRequest, UserQuestionAnswerResponse, UserQuestionAnswerView> {
  constructor() {
    super(ENV.API_URL, 'user-question-answers');
  }

  async listPaged(page = 0, size = 10): Promise<PagingResponse<UserQuestionAnswerResponse>> {
    return this.findAllPaged({ page, size });
  }

  async createAnswer(request: UserQuestionAnswerRequest): Promise<UserQuestionAnswerResponse> {
    return this.create(request);
  }
}

export const userQuestionAnswerService = new UserQuestionAnswerService();