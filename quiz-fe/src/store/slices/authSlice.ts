import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService, LoginResponse, LoginRequest, RegisterRequest } from '../../services/authService';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  access_token: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  access_token: null,
};

// Async thunks
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (loginData: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authService.login(loginData);
      if (response.code === 1000 && response.result) {
        const { access_token, user } = response.result;
        localStorage.setItem('access_token', access_token);
        if (response.result.refresh_token) {
          localStorage.setItem('refresh_token', response.result.refresh_token);
        }
        return {
          access_token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
          } as User,
        };
      }
      return rejectWithValue(response.message || 'Login failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (registerData: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authService.register(registerData);
      if (response.code === 1000 && response.result) {
        return {
          id: response.result.id,
          email: response.result.email,
          username: response.result.username,
          name: response.result.name,
        } as User;
      }
      return rejectWithValue(response.message || 'Registration failed');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getAccountAsync = createAsyncThunk(
  'auth/getAccount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getAccount();
      if (response.code === 1000 && response.result) {
        return {
          id: response.result.id,
          email: response.result.email,
          username: response.result.username,
          name: response.result.name,
          avatar: response.result.avatar,
        } as User;
      }
      return rejectWithValue(response.message || 'Failed to get account');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get account');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    initializeFromStorage: (state) => {
      const token = localStorage.getItem('access_token');
      if (token) {
        state.access_token = token;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.access_token = action.payload.access_token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.error = null;
        // User registered but not authenticated yet (needs OTP verification)
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.access_token = null;
      })
      .addCase(logoutAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get Account
      .addCase(getAccountAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAccountAsync.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getAccountAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, initializeFromStorage } = authSlice.actions;
export default authSlice.reducer;
