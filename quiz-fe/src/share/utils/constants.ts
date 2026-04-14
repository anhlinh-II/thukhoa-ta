// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    ME: "/auth/me",
  },
  QUIZ: {
    LIST: "/quizzes",
    DETAIL: (id: string) => `/quizzes/${id}`,
    QUESTIONS: (id: string) => `/quizzes/${id}/questions`,
    ATTEMPT: (id: string) => `/quizzes/${id}/attempt`,
  },
} as const;

// App Routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  QUIZ_DETAIL: (id: string) => `/quiz/${id}`,
  QUIZ_ATTEMPT: (id: string) => `/quiz/${id}/attempt`,
  PROFILE: "/profile",
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
} as const;

export const NO_HEADER_LIST = [
  "/battle",
  "/admin",
  "/quiz-taking",
  "/quiz-taking/",
  "/auth/login",
  "/auth/register",
  "/auth/verify-otp",
];

export const LOCALIZED_ERRORS: Record<number, string> = {
  1006: 'Bạn cần đăng nhập để thực hiện thao tác này.', // UNAUTHENTICATED
  1007: 'Bạn không có quyền truy cập.', // UNAUTHORIZED
  1002: 'Thực thể đã tồn tại.', // ENTITY_EXISTED
  1005: 'Không tìm thấy dữ liệu.', // ENTITY_NOT_EXISTED
  1011: 'Token truy cập không hợp lệ.', // INVALID_ACCESS_TOKEN
};

export const COLOR_CODE = {
  SKY_600: '#0284c7',
  SKY_500: '#0ea5e9'
}
