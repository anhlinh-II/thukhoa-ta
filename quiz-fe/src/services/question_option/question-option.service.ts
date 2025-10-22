import { ENV } from "@/config/env";
import { BaseService } from "../BaseService";
import { QuestionOption, QuestionOptionRequest, QuestionOptionResponse, QuestionOptionView } from "./models";

export class QuestionOptionService extends BaseService<
QuestionOption,
QuestionOptionRequest,
QuestionOptionResponse,
QuestionOptionView
> {
     constructor() {
          super(ENV.API_URL, 'question-options');
     }
}

export const questionOptionService = new QuestionOptionService();