import { ENV } from "@/share/config/env";
import { BaseService } from "../BaseService";
import { Question, QuestionRequest, QuestionResponse, QuestionView } from "./models";

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