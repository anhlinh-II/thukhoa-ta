import { ENV } from "@/config/env";
import { BaseEntity, BaseService } from "./BaseService";
import { QuestionRequest } from "./question/models";
import { QuestionGroupRequest } from "./question_group/models";
import { QuestionOptionRequest } from "./question_option/models";

export interface QuizMockTest extends BaseEntity {
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

export interface QuizMockTestRequest {
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

export interface QuizMockTestResponse extends QuizMockTest {
     groupName: string;
     totalMockTest: number;
}

export interface QuizMockTestView extends QuizMockTest {
    totalMockTest: number;
}

export class QuizMockTestService extends BaseService<
QuizMockTest,
QuizMockTestRequest,
QuizMockTestResponse,
QuizMockTestView
> {
     constructor() {
          super(ENV.API_URL, 'quiz-mock-tests');
     }
}

export const quizMockTestService = new QuizMockTestService();