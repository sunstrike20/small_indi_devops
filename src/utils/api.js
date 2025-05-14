import { BASE_URL } from './constants';

// List of sensitive endpoints where we should mask data
const SENSITIVE_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/password-reset',
  '/password-reset/reset'
];

// Function to mask sensitive data in request bodies
const maskSensitiveData = (body, endpoint) => {
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
const maskSensitiveResponse = (data, endpoint) => {
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

export const checkResponse = async (res) => {
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }
  
  const data = await res.json();
  
  if (data.success === false) {
    throw new Error(data.message || 'Ошибка при выполнении запроса');
  }
  
  return data;
};

export const request = async (endpoint, options = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const startTime = performance.now();
  
  // Log the request details
  const requestBody = options.body ? JSON.parse(options.body) : null;
  const maskedBody = maskSensitiveData(requestBody, endpoint);
  
  console.log(
    `[API Request] ${options.method || 'GET'} ${url}`,
    `\nHeaders: ${JSON.stringify(options.headers || {})}`,
    maskedBody ? `\nBody: ${JSON.stringify(maskedBody)}` : ''
  );
  
  try {
    const res = await fetch(url, options);
    const data = await checkResponse(res);
    
    // Calculate request duration
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Log the response (masking sensitive data)
    const maskedResponse = maskSensitiveResponse(data, endpoint);
    console.log(
      `[API Response] Status: ${res.status}, Success: ${data.success}`,
      `\nData: ${JSON.stringify(maskedResponse)}`,
      `\nDuration: ${duration}ms`
    );
    
    return data;
  } catch (error) {
    // Calculate request duration for errors too
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);
    
    // Log the error
    console.error(
      `[API Error] ${options.method || 'GET'} ${url}`,
      `\nError: ${error.message}`,
      `\nDuration: ${duration}ms`
    );
    
    // Check if it's a timeout or network error
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('Network Error')) {
      throw new Error('Network error. Please check your connection');
    }
    
    throw error;
  }
};
