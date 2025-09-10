import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Quiz, Question, QuizAttempt } from '../../types';

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  questions: Question[];
  currentAttempt: QuizAttempt | null;
  loading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  questions: [],
  currentAttempt: null,
  loading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setQuizzes: (state, action: PayloadAction<Quiz[]>) => {
      state.quizzes = action.payload;
    },
    setCurrentQuiz: (state, action: PayloadAction<Quiz>) => {
      state.currentQuiz = action.payload;
    },
    setQuestions: (state, action: PayloadAction<Question[]>) => {
      state.questions = action.payload;
    },
    setCurrentAttempt: (state, action: PayloadAction<QuizAttempt>) => {
      state.currentAttempt = action.payload;
    },
    clearQuizError: (state) => {
      state.error = null;
    },
    setQuizLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setQuizzes,
  setCurrentQuiz,
  setQuestions,
  setCurrentAttempt,
  clearQuizError,
  setQuizLoading,
} = quizSlice.actions;

export default quizSlice.reducer;
