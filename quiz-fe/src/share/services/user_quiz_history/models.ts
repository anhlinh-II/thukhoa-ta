import { BaseEntity } from "../BaseService";

export interface UserQuizHis extends BaseEntity {
    userId: number;

    quizMockTestId: number;

    score: number;

    totalQuestions: number;

    correctCount: number;
    
    timeSpent?: number;
    
    examName?: string;
    
  // Matches backend GroupType: FORMAT, TOPIC, MOCK_TEST, OTHER
  quizType?: 'FORMAT' | 'TOPIC' | 'MOCK_TEST' | 'OTHER';
}

export interface UserQuizHisRequest {

}

export interface UserQuizHisView extends UserQuizHis {

}

export interface UserQuizHisResponse extends UserQuizHisView {
  quizMockTestId: number;
  score: number;
  totalQuestions: number;
  correctCount: number;
  examName?: string;
}