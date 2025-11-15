import { BaseEntity } from "../BaseService";
import { QuestionRequest } from "../question/models";
import { QuestionGroupRequest } from "../question_group/models";
import { QuestionOptionRequest } from "../question_option/models";

export interface QuizFormat extends BaseEntity {
     quizGroup: string | number;
     title: string;
     description: string;
     slug: string;
     examName: string;
     durationMinutes: string;
     totalQuestions: string;
     instructions: string;
     shuffleQuestions: string;
     showResultsImmediately: string;
     displayOrder: string;
     isActive: string;
     isDeleted: string;
}

export interface QuestionGroupWithQuestionsDto {
     group: QuestionGroupRequest;
     questions: QuestionWithOptionsDto[];
}

export interface QuestionWithOptionsDto {
     question: QuestionRequest;
     options: QuestionOptionRequest[];
}

export interface QuizFormatRequest {
     quizGroup: number;
     title: string;
     description: string;
     slug: string;
     examName: string;
     durationMinutes: string;
     totalQuestions: number;
     passingScore: number;
     instructions: string;
     maxAttempts: number;
     shuffleQuestions: boolean;
     showResultsImmediately: boolean;
     certificateEligible: boolean;
     displayOrder: number;
     isActive: boolean;
     // Nested question creation support
     questionGroups?: QuestionGroupWithQuestionsDto[];
     standaloneQuestions?: QuestionWithOptionsDto[];
}

export interface QuizFormatResponse extends QuizFormat {
     groupName: string;
     totalMockTest: number;
}

export interface QuizFormatView extends QuizFormat {
    totalMockTest: number;
}