export interface UserLearningItemResponse {
  id: number;
  userId: number;
  questionId: number;
  ef?: number;
  repetitions?: number;
  intervalDays?: number;
  nextReviewAt?: string;
  lastReviewedAt?: string;
  lapses?: number;
  consecutiveFails?: number;
  priority?: number;
  learningType?: string;
}
