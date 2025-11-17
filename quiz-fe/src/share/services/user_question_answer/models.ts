import { BaseEntity, BaseView } from "../BaseService";

export interface UserQuestionAnswer extends BaseEntity {
  userId: number;
  questionOptionId: number;
  quizHisId: number;
  timeSpent: number;
  isCorrect: boolean;
}

export interface UserQuestionAnswerRequest {
  id: number | string;
  userId: number;
  questionOptionId: number;
  quizHisId: number;
  timeSpent: number;
  isCorrect: boolean;
}

export interface UserQuestionAnswerView extends BaseView {
  userId: number;
  questionOptionId: number;
  quizHisId: number;
  timeSpent: number;
  isCorrect: boolean;
}

export interface UserQuestionAnswerResponse extends UserQuestionAnswerView {
}
