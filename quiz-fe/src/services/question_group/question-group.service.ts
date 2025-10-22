import { ENV } from "@/config/env";
import { BaseService } from "../BaseService";
import { QuestionGroup, QuestionGroupRequest, QuestionGroupResponse, QuestionGroupView } from "./models";

export class QuestionGroupService extends BaseService<
QuestionGroup,
QuestionGroupRequest,
QuestionGroupResponse,
QuestionGroupView
> {
     constructor() {
          super(ENV.API_URL, 'question-groups');
     }
}

export const questionGroupService = new QuestionGroupService();