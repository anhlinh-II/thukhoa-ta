export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit?: number;
  totalQuestions: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  content: string;
  type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'ESSAY';
  options?: string[];
  correctAnswer: string;
  points: number;
  quizId: string;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  startedAt: string;
  completedAt?: string;
  answers: Answer[];
}

export interface Answer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
  points: number;
}

export interface ApiResponse<T> {
  code: number;
  success: boolean;
  result?: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  result?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterItemDto {
    field?: string|null|undefined;
    operator?:  FilterOperator|null|undefined;
    value?: any;
    ors?: Array<FilterItemDto>|null|undefined;
    dataType?: "STRING" | "DATETIME" | "NUMBER" | "BOOL"
}

export declare type FilterOperator =
  | "="
  | "!="
  | ">"
  | ">="
  | "<"
  | "<="
  | "CONTAINS"
  | "NCONTAINS"
  | "STARTSWITH"
  | "ENDSWITH"
  | "BETWEEN"
  | "NOT BETWEEN"
  | "IN"
  | "NOT IN"
  | "EMPTY"
  | "NEMPTY"
  | "IS NULL"
  | "IS NOT NULL"
  | "ORG ALL IN CHILDREN BY ID"
  | "ORG ALL IN CHILDREN BY CODE";
