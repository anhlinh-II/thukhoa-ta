import { BaseEntity, BaseService } from "./BaseService";

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
}

export interface QuizMockTestResponse extends QuizMockTest {
     groupName: string;
}

export interface QuizMockTestView extends QuizMockTest {
    
}

export class QuizMockTestService extends BaseService<
QuizMockTest,
QuizMockTestRequest,
QuizMockTestResponse,
QuizMockTestView
> {
     constructor() {
          super('http://localhost:8080/api/v1', 'quiz-mock-tests');
     }
}

export const quizMockTestService = new QuizMockTestService();