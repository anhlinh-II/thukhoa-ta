import { BaseEntity } from "../BaseService";

export enum QuestionType {

}

export enum QuizType {
     QUIZ_MOCK_TEST = 'QUIZ_MOCK_TEST',
     QUIZ_TOPIC = 'QUIZ_TOPIC',
     QUIZ_FORMAT = 'QUIZ_FORMAT',
}

export interface Question extends BaseEntity {
     id: number;
     type: QuestionType;
     groupId: number;
     contentHtml: string;
     score: number;
     orderIndex: number;
     metadata: string;
     explanationHtml: string;
     quizId: number;
     quizType: QuizType;
}

export interface QuestionRequest {
     id: number;
     type: QuestionType;
     groupId: number;
     contentHtml: string;
     score: number;
     orderIndex: number;
     metadata: string;
     explanationHtml: string;
}

export interface QuestionView extends Question {}

export interface QuestionResponse extends QuestionView {}