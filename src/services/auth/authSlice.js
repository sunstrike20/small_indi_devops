import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '../../utils/api';
import Cookies from 'js-cookie';

// Cookie config
const REFRESH_TOKEN_COOKIE_NAME = 'refreshToken';
const COOKIE_OPTIONS = { 
  expires: 7, 
  path: '/',
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production' 
}; // 7 days expiration

// Helper functions for token handling
export const setRefreshToken = (token) => {
  Cookies.set(REFRESH_TOKEN_COOKIE_NAME, token, COOKIE_OPTIONS);
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_COOKIE_NAME);
};

export const removeRefreshToken = () => {
  Cookies.remove(REFRESH_TOKEN_COOKIE_NAME, { path: '/' });
};

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await request('/auth/register', {
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
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await request('/auth/login', {
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
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const token = getRefreshToken();
      
      if (!token) {
        return rejectWithValue('No refresh token found');
      }
      
      const response = await request('/auth/logout', {
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
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const token = getRefreshToken();
      
      if (!token) {
        return rejectWithValue('No refresh token found');
      }
      
      const response = await request('/auth/token', {
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
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Вспомогательная функция для проверки и форматирования токена
const formatAuthToken = (token) => {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

export const fetchUser = createAsyncThunk(
  'auth/fetchUser',
  async (_, { getState, dispatch, rejectWithValue }) => {
    // Не меняем состояние loading, если у нас уже есть данные пользователя
    // Это предотвратит лишние перерисовки
    const { auth } = getState();
    const skipLoadingState = !!auth.user;
    
    // Если есть пользователь в стейте и нет токена - значит состояние противоречивое
    if (auth.user && !auth.accessToken) {
      console.log('[AUTH] Inconsistent state detected: user exists but no token');
      dispatch(resetAuthState());
      removeRefreshToken();
      return rejectWithValue('Authentication state is invalid');
    }

    try {
      if (!auth.accessToken) {
        return rejectWithValue('No access token found');
      }
      
      console.log('[AUTH] Fetching user data');
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      try {
        const response = await request('/auth/user', {
          method: 'GET',
          headers: {
            'Authorization': formatAuthToken(auth.accessToken)
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.success) {
          console.log('[AUTH] User data fetch successful');
          return {
            user: response.user,
            skipLoadingState
          };
        }
        
        return rejectWithValue('Failed to fetch user data');
      } catch (requestError) {
        clearTimeout(timeoutId);
        throw requestError;
      }
    } catch (error) {
      // If aborted due to timeout
      if (error.name === 'AbortError' || error.message.includes('timed out')) {
        return rejectWithValue('Request timed out. Please try again later.');
      }
      
      // Если получена ошибка авторизации (401 или 403), пробуем обновить токен, избегая рекурсии
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('[AUTH] Auth error detected, attempting to refresh token');
        try {
          // Используем thunk.extra для передачи флага о попытке обновления токена
          // Это позволит избежать бесконечной рекурсии
          const tokenRefreshed = getState().auth.tokenRefreshAttempted;
          
          // Если уже была попытка обновить токен, выходим чтобы избежать рекурсии
          if (tokenRefreshed) {
            console.log('[AUTH] Token refresh already attempted, stopping to prevent recursion');
            // Очищаем состояние авторизации
            dispatch(resetAuthState());
            removeRefreshToken();
            return rejectWithValue('Session expired. Please login again.');
          }
          
          // Устанавливаем флаг попытки обновления токена
          dispatch(setTokenRefreshAttempted(true));
          
          // Пробуем обновить токен
          await dispatch(refreshToken()).unwrap();
          
          // Сбрасываем флаг попытки обновления токена
          dispatch(setTokenRefreshAttempted(false));
          
          // После успешного обновления токена повторяем запрос
          const { auth: newAuthState } = getState();
          if (!newAuthState.accessToken) {
            return rejectWithValue('Failed to refresh access token');
          }
          
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), 10000);
          
          try {
            const retryResponse = await request('/auth/user', {
              method: 'GET',
              headers: {
                'Authorization': formatAuthToken(newAuthState.accessToken)
              },
              signal: retryController.signal
            });
            
            clearTimeout(retryTimeoutId);
            
            if (retryResponse.success) {
              return {
                user: retryResponse.user,
                skipLoadingState: false // После обновления токена меняем состояние loading
              };
            }
            
            return rejectWithValue('Failed to fetch user data after token refresh');
          } catch (retryError) {
            clearTimeout(retryTimeoutId);
            return rejectWithValue(retryError.message || 'Failed after token refresh');
          }
        } catch (refreshError) {
          // Сбрасываем флаг попытки обновления токена
          dispatch(setTokenRefreshAttempted(false));
          // Очищаем данные авторизации
          dispatch(resetAuthState());
          removeRefreshToken();
          return rejectWithValue('Authentication expired. Please login again.');
        }
      }
      return rejectWithValue(error.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async (userData, { getState, dispatch, rejectWithValue }) => {
    try {
      const { auth } = getState();
      
      if (!auth.accessToken) {
        return rejectWithValue('No access token found');
      }
      
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      try {
        const response = await request('/auth/user', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': formatAuthToken(auth.accessToken)
          },
          body: JSON.stringify(userData),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.success) {
          return {
            user: response.user
          };
        }
        
        return rejectWithValue('Failed to update user data');
      } catch (requestError) {
        clearTimeout(timeoutId);
        throw requestError;
      }
    } catch (error) {
      // If aborted due to timeout
      if (error.name === 'AbortError' || error.message.includes('timed out')) {
        return rejectWithValue('Request timed out. Please try again later.');
      }
      
      // Если получена ошибка авторизации (401 или 403), пробуем обновить токен, избегая рекурсии
      if (error.message.includes('401') || error.message.includes('403')) {
        console.log('Auth error detected in updateUser, attempting to refresh token');
        try {
          // Проверяем, была ли уже попытка обновления токена
          const tokenRefreshed = getState().auth.tokenRefreshAttempted;
          
          // Если уже была попытка обновить токен, выходим чтобы избежать рекурсии
          if (tokenRefreshed) {
            console.log('Token refresh already attempted, stopping to prevent recursion');
            // Очищаем состояние авторизации
            dispatch(resetAuthState());
            removeRefreshToken();
            return rejectWithValue('Session expired. Please login again.');
          }
          
          // Устанавливаем флаг попытки обновления токена
          dispatch(setTokenRefreshAttempted(true));
          
          // Пробуем обновить токен
          await dispatch(refreshToken()).unwrap();
          
          // Сбрасываем флаг попытки обновления токена
          dispatch(setTokenRefreshAttempted(false));
          
          // После успешного обновления токена повторяем запрос
          const { auth: newAuthState } = getState();
          if (!newAuthState.accessToken) {
            return rejectWithValue('Failed to refresh access token');
          }
          
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), 10000);
          
          try {
            const retryResponse = await request('/auth/user', {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': formatAuthToken(newAuthState.accessToken)
              },
              body: JSON.stringify(userData),
              signal: retryController.signal
            });
            
            clearTimeout(retryTimeoutId);
            
            if (retryResponse.success) {
              return {
                user: retryResponse.user
              };
            }
            
            return rejectWithValue('Failed to update user data after token refresh');
          } catch (retryError) {
            clearTimeout(retryTimeoutId);
            return rejectWithValue(retryError.message || 'Failed after token refresh');
          }
        } catch (refreshError) {
          // Сбрасываем флаг попытки обновления токена
          dispatch(setTokenRefreshAttempted(false));
          // Очищаем данные авторизации
          dispatch(resetAuthState());
          removeRefreshToken();
          return rejectWithValue('Authentication expired. Please login again.');
        }
      }
      return rejectWithValue(error.message);
    }
  }
);

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  tokenRefreshAttempted: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuthState: () => initialState,
    setTokenRefreshAttempted: (state, action) => {
      state.tokenRefreshAttempted = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      });

    // Token refresh cases
    builder
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.tokenRefreshAttempted = false;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.tokenRefreshAttempted = false;
        // Также удаляем refresh token из cookie при ошибке
        removeRefreshToken();
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
        state.error = action.payload;
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
        state.error = action.payload;
      });
  }
});

export const { clearError, resetAuthState, setTokenRefreshAttempted } = authSlice.actions;
export const authReducer = authSlice.reducer;

// Selectors
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectAccessToken = (state) => state.auth.accessToken; 