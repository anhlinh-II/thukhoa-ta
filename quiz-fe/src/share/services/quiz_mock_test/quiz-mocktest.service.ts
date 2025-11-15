import { ENV } from '../../utils/env';
import { BaseService } from "../BaseService";
import { QuizMockTest, QuizMockTestRequest, QuizMockTestResponse, QuizMockTestView } from './model';

export class QuizMockTestService extends BaseService<
QuizMockTest,
QuizMockTestRequest,
QuizMockTestResponse,
QuizMockTestView
> {
     constructor() {
          super(ENV.API_URL, 'quiz-mock-tests');
     }

     async submit(id: string | number, answers: Record<number, number>): Promise<any> {
          return this.handleRequest<any>(`${this.getEndpoint()}/${id}/submit`, {
               method: 'POST',
               body: JSON.stringify({ answers }),
          });
     }
}

export const quizMockTestService = new QuizMockTestService();