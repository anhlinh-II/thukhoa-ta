import { BaseEntity } from "../BaseService";

export interface QuestionOption extends  BaseEntity {
     id: number;
     questionId: number;
     contentHtml: string;
     isCorrect: boolean;
     matchKey: string;
     orderIndex: number;
}

export interface QuestionOptionRequest extends QuestionOption {}

export interface QuestionOptionView extends QuestionOption {}

export interface QuestionOptionResponse extends QuestionOptionView {}