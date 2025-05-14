// When in development mode, use the proxy url, otherwise use the direct URL
const isProduction = process.env.NODE_ENV === 'production';
export const BASE_URL = isProduction 
  ? 'https://norma.nomoreparties.space/api' 
  : '/api';
