import apiClient from './api';

// Request types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob?: string; // ISO date string
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Response types
export interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    username: string;
    name?: string;
  };
}

export interface UserGetAccount {
  id: string;
  email: string;
  username: string;
  name?: string;
  avatar?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  name?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

export interface CheckEmailResponse {
  exists: boolean;
  isOAuth2User?: boolean;
  provider?: string;
  message: string;
}

// API Service
export const authService = {
  // Login with username/email and password
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post('/users/login', data);
    return response.data;
  },

  // Get current user account info
  getAccount: async (): Promise<ApiResponse<UserGetAccount>> => {
    const response = await apiClient.get('/users/account');
    return response.data;
  },

  // Refresh access token
  refreshToken: async (): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.get('/users/refresh');
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/users/logout');
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<ApiResponse<UserResponse>> => {
    const response = await apiClient.post('/users/register', data);
    return response.data;
  },

  // Verify OTP code
  verifyOtp: async (email: string, otp: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/users/verify-otp', null, {
      params: { email, otp },
    });
    return response.data;
  },

  // Regenerate OTP code
  regenerateOtp: async (email: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.post('/users/regenerate-otp', null, {
      params: { email },
    });
    return response.data;
  },

  // Check if email exists and get provider info
  checkEmailExists: async (email: string): Promise<ApiResponse<CheckEmailResponse>> => {
    const response = await apiClient.get('/users/check-email', {
      params: { email },
    });
    return response.data;
  },

  // Get OAuth2 authorization URLs
  getOAuth2Urls: async (): Promise<ApiResponse<{ googleAuthUrl: string; instruction: string }>> => {
    const response = await apiClient.get('/users/oauth2-url');
    return response.data;
  },

  // Forgot password - request password reset
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiResponse<string>> => {
    const response = await apiClient.post('/users/forgot-password', data);
    return response.data;
  },

  // Reset password - complete password reset
  resetPassword: async (data: ResetPasswordRequest): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/users/reset-password', data);
    return response.data;
  },
};
