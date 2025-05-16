import { request } from './api';
import { refreshToken as refreshTokenAction, getRefreshToken } from '../services/auth/authSlice';
import { RequestOptions, ApiResponse } from './store-types';
import { AppDispatch } from './store-types';

// Вспомогательная функция для проверки и форматирования токена
const formatAuthToken = (token: string | null): string => {
  if (!token) return '';
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

// Enhanced request function that handles token refresh
export const authRequest = async <T>(
  endpoint: string, 
  options: RequestOptions = {}, 
  dispatch: AppDispatch, 
  getState: () => any
): Promise<T> => {
  try {
    // If we have an access token and this is an authenticated request, add it to headers
    const { auth } = getState();
    if (auth.accessToken && options.withAuth) {
      // Remove the withAuth property as it's not a standard fetch option
      const { withAuth, ...fetchOptions } = options;
      
      // Add the Authorization header with the access token
      const authOptions = {
        ...fetchOptions,
        headers: {
          ...fetchOptions.headers,
          'Authorization': formatAuthToken(auth.accessToken)
        }
      };
      
      try {
        return await request<T>(endpoint, authOptions);
      } catch (error: any) {
        // If we get a 401 Unauthorized, attempt to refresh the token
        if (error.message.includes('401') || error.message.includes('403')) {
          console.log('Auth error in authRequest, attempting to refresh token');
          // Only attempt token refresh if we have a refresh token
          const refreshToken = getRefreshToken();
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }
          
          // Try to refresh the token
          const refreshResult = await dispatch(refreshTokenAction()).unwrap();
          
          // If token refresh was successful, retry the original request with the new token
          if (refreshResult.accessToken) {
            const newAuthOptions = {
              ...fetchOptions,
              headers: {
                ...fetchOptions.headers,
                'Authorization': formatAuthToken(refreshResult.accessToken)
              }
            };
            
            return await request<T>(endpoint, newAuthOptions);
          }
        }
        
        // If we couldn't handle the error, rethrow it
        throw error;
      }
    } else {
      // For non-authenticated requests, just use the standard request function
      const { withAuth, ...fetchOptions } = options;
      return await request<T>(endpoint, fetchOptions);
    }
  } catch (error: any) {
    throw error;
  }
}; 