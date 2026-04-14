import { ENV } from '../../utils/env';
import { BaseService } from "../BaseService";
import { QuizTopic, QuizTopicRequest, QuizTopicResponse, QuizTopicView } from './model';

export class QuizTopicService extends BaseService<
QuizTopic,
QuizTopicRequest,
QuizTopicResponse,
QuizTopicView
> {
     constructor() {
          super(ENV.API_URL, 'quiz-topics');
     }

     async submit(id: string | number, answers: Record<number, number>): Promise<any> {
          return this.handleRequest<any>(`${this.getEndpoint()}/${id}/submit`, {
               method: 'POST',
               body: JSON.stringify({ answers }),
          });
     }
}

export const quizTopicService = new QuizTopicService();