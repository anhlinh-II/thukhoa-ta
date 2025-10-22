import { BaseService } from "../BaseService";
import { Question, QuestionRequest, QuestionResponse, QuestionView } from "./models";
import { ENV } from "@/config/env";

export class QuestionService extends BaseService<
Question,
QuestionRequest,
QuestionResponse,
QuestionView
> {
     constructor() {
          super(ENV.API_URL, 'questions');
     }
}

export const questionService = new QuestionService();