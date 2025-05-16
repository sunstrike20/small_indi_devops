import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { request } from '../../utils/api';
import Cookies from 'js-cookie';
import { 
  User, 
  AuthState, 
  AuthResponse, 
  RootState 
} from '../../utils/types';
import { 
  RegisterData, 
  LoginData, 
  UpdateUserData,
  ApiResponse
} from '../../utils/store-types';

// Cookie config
const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS: Cookies.CookieAttributes = { 
  expires: 7, 
  path: '/',
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production' 
}; // 7 days expiration

// Helper functions for token handling
export const setRefreshToken = (token: string): void => {
  Cookies.set(REFRESH_TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
};

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
};

export const removeRefreshToken = (): void => {
  Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
};

// Async thunks
export const register = createAsyncThunk<
  { user: User; accessToken: string },
  RegisterData,
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await request<AuthResponse>('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (response.success) {
        setRefreshToken(response.refreshToken);
        return {
          user: response.user,
          accessToken: response.accessToken
        };
      }
      
      return rejectWithValue('Registration failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk<
  { user: User; accessToken: string },
  LoginData,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await request<AuthResponse>('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      if (response.success) {
        setRefreshToken(response.refreshToken);
        return {
          user: response.user,
          accessToken: response.accessToken
        };
      }
      
      return rejectWithValue('Login failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = getRefreshToken();
      
      if (!token) {
        return rejectWithValue('No refresh token found');
      }
      
      const response = await request<{ success: boolean }>('/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (response.success) {
        removeRefreshToken();
        return true;
      }
      
      return rejectWithValue('Logout failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk<
  { accessToken: string },
  void,
  { rejectValue: string }
>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = getRefreshToken();
      
      if (!token) {
        return rejectWithValue('No refresh token found');
      }
      
      const response = await request<AuthResponse>('/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (response.success) {
        setRefreshToken(response.refreshToken);
        return {
          accessToken: response.accessToken
        };
      }
      
      return rejectWithValue('Token refresh failed');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Вспомогательная функция для проверки и форматирования токена
const formatAuthToken = (token: string | null): string => {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

interface FetchUserResult {
  user: User;
  skipLoadingState?: boolean;
}

export const fetchUser = createAsyncThunk<
  FetchUserResult,
  void,
  { 
    rejectValue: string; 
    state: RootState;
  }
>(
  'auth/fetchUser',
  async (_, { getState, dispatch, rejectWithValue }) => {
    // Не меняем состояние loading, если у нас уже есть данные пользователя
    // Это предотвратит лишние перерисовки
    const { auth } = getState();
    const skipLoadingState = !!auth.user;
    
    // Если есть пользователь в стейте и нет токена - значит состояние противоречивое
    if (auth.user && !auth.accessToken) {
      console.log('[AUTH] Inconsistent state detected: user exists but no token');
      return rejectWithValue('Inconsistent auth state');
    }
    
    // Проверяем наличие токена
    if (!auth.accessToken) {
      console.log('[AUTH] No access token found, trying to refresh');
      
      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        return rejectWithValue('No refresh token available');
      }
      
      try {
        // Пробуем обновить токен
        await dispatch(refreshToken()).unwrap();
      } catch (error) {
        console.error('[AUTH] Failed to refresh token:', error);
        return rejectWithValue('Token refresh failed');
      }
    }
    
    try {
      // Use a controller to be able to abort the request if necessary
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await request<AuthResponse>('/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formatAuthToken(getState().auth.accessToken)
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.success && response.user) {
        return {
          user: response.user,
          skipLoadingState
        };
      }
      
      return rejectWithValue('Failed to fetch user data');
    } catch (error: any) {
      // If we get an auth error, try to refresh the token
      if (error.message && error.message.includes('403')) {
        try {
          const tokenResult = await dispatch(refreshToken()).unwrap();
          if (tokenResult.accessToken) {
            // Retry with new token
            const retryResponse = await request<AuthResponse>('/auth/user', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': formatAuthToken(tokenResult.accessToken)
              }
            });
            
            if (retryResponse.success && retryResponse.user) {
              return {
                user: retryResponse.user,
                skipLoadingState
              };
            }
          }
        } catch (refreshError) {
          console.error("[AUTH] Failed to refresh token", refreshError);
        }
      }
      
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

export const updateUser = createAsyncThunk<
  { user: User },
  UpdateUserData,
  { 
    rejectValue: string; 
    state: RootState;
  }
>(
  'auth/updateUser',
  async (userData, { getState, rejectWithValue }) => {
    const { auth } = getState();
    
    try {
      // Use a controller to be able to abort the request if necessary
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await request<AuthResponse>('/auth/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': formatAuthToken(auth.accessToken)
        },
        body: JSON.stringify(userData)
      });
      
      clearTimeout(timeoutId);
      
      if (response.success && response.user) {
        return { user: response.user };
      }
      
      return rejectWithValue('Failed to update user data');
    } catch (error: any) {
      return rejectWithValue(error.message || 'Unknown error');
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  tokenRefreshAttempted: false
};

// Функция для логирования состояния авторизации
const logAuthState = (state: AuthState, action: string): void => {
  console.log(`[AUTH] ${action} - Current state:`, {
    user: state.user ? `${state.user.name} (${state.user.email})` : 'null',
    isAuthenticated: state.isAuthenticated,
    hasAccessToken: !!state.accessToken,
    loading: state.loading,
    error: state.error,
    tokenRefreshAttempted: state.tokenRefreshAttempted
  });
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      logAuthState(state, 'clearError');
    },
    resetAuthState: () => {
      console.log('[AUTH] State reset to initial');
      return initialState;
    },
    setTokenRefreshAttempted: (state, action: PayloadAction<boolean>) => {
      state.tokenRefreshAttempted = action.payload;
      console.log(`[AUTH] tokenRefreshAttempted set to ${action.payload}`);
      logAuthState(state, 'setTokenRefreshAttempted');
    },
    setAutoLoginAttempted: (state) => {
      // Устанавливаем флаг, чтобы обозначить завершение проверки автологина
      state.tokenRefreshAttempted = true;
      state.loading = false;
      console.log('[AUTH] Auto login check completed and marked as attempted');
      logAuthState(state, 'setAutoLoginAttempted');
    }
  },
  extraReducers: (builder) => {
    // Register cases
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Registration failed';
      });

    // Login cases
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
      });

    // Logout cases
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Logout failed';
      });

    // Token refresh cases
    builder
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('[AUTH] refreshToken.pending');
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.tokenRefreshAttempted = true; // Отметить, что попытка обновления токена выполнена
        console.log('[AUTH] refreshToken.fulfilled - Token refreshed successfully');
        logAuthState(state, 'refreshToken.fulfilled');
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Token refresh failed';
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.tokenRefreshAttempted = true; // Даже при ошибке отмечаем, что попытка была выполнена
        // Также удаляем refresh token из cookie при ошибке
        removeRefreshToken();
        console.log('[AUTH] refreshToken.rejected:', action.payload);
        logAuthState(state, 'refreshToken.rejected');
      });

    // Fetch user cases
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        // Проверяем флаг skipLoadingState из ответа
        if (action.payload.skipLoadingState) {
          console.log('[AUTH] Skipping loading state change for fetchUser');
        } else {
          state.loading = false;
        }
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user';
      });

    // Update user cases
    builder
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update user';
      });
  }
});

export const { clearError, resetAuthState, setTokenRefreshAttempted, setAutoLoginAttempted } = authSlice.actions;
export const authReducer = authSlice.reducer;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAccessToken = (state: RootState) => state.auth.accessToken; 