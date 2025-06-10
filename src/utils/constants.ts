// When in development mode, use the proxy url, otherwise use the direct URL
const isProduction: boolean = process.env.NODE_ENV === 'production';
export const BASE_URL: string = isProduction
	? 'https://norma.nomoreparties.space/api'
	: '/api';
