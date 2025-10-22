import { BaseEntity } from "../BaseService";

export interface QuizGroup extends BaseEntity {
  name: string;
  description?: string;
  isDeleted: boolean;
}

export interface QuizGroupRequest {
  name: string;
  description?: string;
}

export interface QuizGroupResponse extends QuizGroup {}

export interface QuizGroupView extends QuizGroup {
  totalQuizzes?: number;
  activeQuizzes?: number;
}