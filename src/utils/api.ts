import { BASE_URL } from './constants';
import { ApiResponse, ApiError, RequestOptions } from './store-types';

// List of sensitive endpoints where we should mask data
const SENSITIVE_ENDPOINTS: string[] = [
  '/auth/login',
  '/auth/register',
  '/password-reset',
  '/password-reset/reset'
];

// Function to mask sensitive data in request bodies
const maskSensitiveData = (body: any, endpoint: string): any => {
  if (!body) return body;
  
  // Create a deep copy to avoid modifying the original
  const maskedBody = JSON.parse(JSON.stringify(body));
  
  // Mask sensitive fields based on endpoint
  if (SENSITIVE_ENDPOINTS.some(ep => endpoint.includes(ep))) {
    if (maskedBody.password) maskedBody.password = '****';
    if (maskedBody.token) maskedBody.token = maskedBody.token.substring(0, 10) + '...';
  }
  
  return maskedBody;
};

// Function to mask sensitive data in responses
const maskSensitiveResponse = (data: any, endpoint: string): any => {
  if (!data) return data;
  
  // Create a deep copy to avoid modifying the original
  const maskedData = JSON.parse(JSON.stringify(data));
  
  // Mask sensitive fields based on endpoint
  if (endpoint.includes('/auth/')) {
    if (maskedData.accessToken) maskedData.accessToken = maskedData.accessToken.substring(0, 10) + '...';
    if (maskedData.refreshToken) maskedData.refreshToken = maskedData.refreshToken.substring(0, 10) + '...';
  }
  
  return maskedData;
};

export const checkResponse = async <T>(res: Response): Promise<T> => {
  if (!res.ok) {
    const errorMessage = `HTTP error! Status: ${res.status}`;
    console.error(`[API Error] ${errorMessage}`);
    throw new Error(errorMessage);
  }
  
  const data = await res.json() as T;
  
  if (!data) {
    const errorMessage = 'No data received from server';
    console.error(`[API Error] ${errorMessage}`);
    throw new Error(errorMessage);
  }
  
  if ((data as any).success === false) {
    const errorMessage = (data as any).message || 'Ошибка при выполнении запроса';
    console.error(`[API Error] ${errorMessage}`);
    throw new Error(errorMessage);
  }
  
  return data;
};

export const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const url = `${BASE_URL}${endpoint}`;
  const startTime = performance.now();
  const requestId = Math.random().toString(36).substring(2, 9); // Уникальный ID для отслеживания запроса
  
  // Log the request details
  const requestBody = options.body ? JSON.parse(options.body) : null;
  const maskedBody = maskSensitiveData(requestBody, endpoint);
  
  console.log(
    `[API Request ${requestId}] ${options.method || 'GET'} ${url}`,
    `\nHeaders: ${JSON.stringify(options.headers || {})}`,
    maskedBody ? `\nBody: ${JSON.stringify(maskedBody)}` : ''
  );
  
  try {
    let timeoutId: number | null = null;
    
    // Создаем обертку для запроса с таймаутом
    const fetchPromise = fetch(url, options as RequestInit);
    const timeoutPromise = new Promise<Response>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        console.error(`[API Timeout ${requestId}] Request timed out: ${url}`);
        reject(new Error('Request timed out after 30 seconds'));
      }, 30000); // 30 секунд таймаут
    });
    
    // Используем race для обработки таймаута
    const res = await Promise.race([fetchPromise, timeoutPromise]);
    
    // Очищаем таймаут, если запрос успешен
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    const data = await checkResponse<T>(res);
    
    // Calculate request duration
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Log the response (masking sensitive data)
    const maskedResponse = maskSensitiveResponse(data, endpoint);
    console.log(
      `[API Response ${requestId}] Status: ${res.status}, Success: ${
        typeof data === 'object' && data !== null && 'success' in data 
          ? data.success 
          : 'N/A'
      }`,
      `\nData: ${JSON.stringify(maskedResponse)}`,
      `\nDuration: ${duration}ms`
    );
    
    return data;
  } catch (error: any) {
    // Calculate request duration for errors too
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Log the error
    console.error(
      `[API Error ${requestId}] ${options.method || 'GET'} ${url}`,
      `\nError: ${error.message}`,
      `\nDuration: ${duration}ms`,
      `\nStack: ${error.stack || 'No stack trace available'}`
    );
    
    // Check if it's a timeout or network error
    if (error.name === 'AbortError' || error.message.includes('timed out')) {
      throw new Error('Request timed out');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
      throw new Error('Network error. Please check your connection');
    }
    
    throw error;
  }
}; 