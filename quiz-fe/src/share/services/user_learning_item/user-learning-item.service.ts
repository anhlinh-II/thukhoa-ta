import { ENV } from '../../utils/env';
import { BaseService } from '../BaseService';
import { UserLearningItemResponse } from './models';

export class UserLearningItemService extends BaseService<any, any, any, UserLearningItemResponse> {
  constructor() {
    super(ENV.API_URL, 'user-learning-items');
  }

  async due(type: string = 'MOCKTEST') {
    return this.handleRequest<UserLearningItemResponse[]>(`${this.getEndpoint()}/due?type=${type}`);
  }

  async review(id: number | string, quality: number) {
    return this.handleRequest<any>(`${this.getEndpoint()}/${id}/review`, {
      method: 'POST',
      body: JSON.stringify({ quality }),
    });
  }
}

export const userLearningItemService = new UserLearningItemService();
