import { ENV } from '../../utils/env';
import { BaseService } from "../BaseService";
import { QuizFormat, QuizFormatRequest, QuizFormatResponse, QuizFormatView } from './model';

export class QuizFormatService extends BaseService<
QuizFormat,
QuizFormatRequest,
QuizFormatResponse,
QuizFormatView
> {
     constructor() {
          super(ENV.API_URL, 'quiz-formats');
     }

     async submit(id: string | number, answers: Record<number, number>): Promise<any> {
          return this.handleRequest<any>(`${this.getEndpoint()}/${id}/submit`, {
               method: 'POST',
               body: JSON.stringify({ answers }),
          });
     }
}

export const quizFormatService = new QuizFormatService();