import {
	authReducer,
	initialState,
	clearError,
	resetAuthState,
	setTokenRefreshAttempted,
	setAutoLoginAttempted,
	register,
	login,
	logout,
	refreshToken,
	fetchUser,
	updateUser,
	selectUser,
	selectIsAuthenticated,
	selectAuthLoading,
	selectAuthError,
	selectAccessToken
} from './authSlice';
import { AuthState, User, RootState } from '@utils/types';

// Мокаем зависимости
jest.mock('../../utils/api');
jest.mock('js-cookie');

// Мокаем данные для тестирования
const mockUser: User = {
	email: 'test@example.com',
	name: 'Test User'
};

const mockAccessToken = 'mock-access-token';



// Мокаем console.log для тестов
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('authSlice', () => {
	beforeEach(() => {
		consoleSpy.mockClear();
	});

	afterAll(() => {
		consoleSpy.mockRestore();
	});

	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем синхронные редьюсеры
	describe('reducers', () => {
		test('should handle clearError', () => {
			const stateWithError = {
				...initialState,
				error: 'Some error'
			};
			
			const action = clearError();
			const state = authReducer(stateWithError, action);
			
			expect(state.error).toBeNull();
		});

		test('should handle resetAuthState', () => {
			const stateWithData = {
				...initialState,
				user: mockUser,
				accessToken: mockAccessToken,
				isAuthenticated: true,
				loading: true,
				error: 'Some error',
				tokenRefreshAttempted: true
			};
			
			const action = resetAuthState();
			const state = authReducer(stateWithData, action);
			
			expect(state).toEqual(initialState);
		});

		test('should handle setTokenRefreshAttempted', () => {
			const action = setTokenRefreshAttempted(true);
			const state = authReducer(initialState, action);
			
			expect(state.tokenRefreshAttempted).toBe(true);
		});

		test('should handle setAutoLoginAttempted', () => {
			const action = setAutoLoginAttempted();
			const state = authReducer(initialState, action);
			
			expect(state.tokenRefreshAttempted).toBe(true);
			expect(state.loading).toBe(false);
		});
	});

	// Тестируем async thunks
	describe('async thunks', () => {
		// Register
		describe('register', () => {
			test('should handle register.pending', () => {
				const action = { type: register.pending.type };
				const state = authReducer(initialState, action);
				
				expect(state.loading).toBe(true);
				expect(state.error).toBeNull();
			});

			test('should handle register.fulfilled', () => {
				const loadingState = { ...initialState, loading: true };
				const action = {
					type: register.fulfilled.type,
					payload: { user: mockUser, accessToken: mockAccessToken }
				};
				const state = authReducer(loadingState, action);
				
				expect(state.loading).toBe(false);
				expect(state.user).toEqual(mockUser);
				expect(state.accessToken).toBe(mockAccessToken);
				expect(state.isAuthenticated).toBe(true);
			});

			test('should handle register.rejected', () => {
				const loadingState = { ...initialState, loading: true };
				const action = {
					type: register.rejected.type,
					payload: 'Registration failed'
				};
				const state = authReducer(loadingState, action);
				
				expect(state.loading).toBe(false);
				expect(state.error).toBe('Registration failed');
			});
		});

		// Login
		describe('login', () => {
			test('should handle login.pending', () => {
				const action = { type: login.pending.type };
				const state = authReducer(initialState, action);
				
				expect(state.loading).toBe(true);
				expect(state.error).toBeNull();
			});

			test('should handle login.fulfilled', () => {
				const loadingState = { ...initialState, loading: true };
				const action = {
					type: login.fulfilled.type,
					payload: { user: mockUser, accessToken: mockAccessToken }
				};
				const state = authReducer(loadingState, action);
				
				expect(state.loading).toBe(false);
				expect(state.user).toEqual(mockUser);
				expect(state.accessToken).toBe(mockAccessToken);
				expect(state.isAuthenticated).toBe(true);
			});

			test('should handle login.rejected', () => {
				const loadingState = { ...initialState, loading: true };
				const action = {
					type: login.rejected.type,
					payload: 'Login failed'
				};
				const state = authReducer(loadingState, action);
				
				expect(state.loading).toBe(false);
				expect(state.error).toBe('Login failed');
			});
		});

		// Logout
		describe('logout', () => {
			test('should handle logout.pending', () => {
				const action = { type: logout.pending.type };
				const state = authReducer(initialState, action);
				
				expect(state.loading).toBe(true);
				expect(state.error).toBeNull();
			});

			test('should handle logout.fulfilled', () => {
				const authenticatedState = {
					...initialState,
					user: mockUser,
					accessToken: mockAccessToken,
					isAuthenticated: true,
					loading: true
				};
				
				const action = { type: logout.fulfilled.type };
				const state = authReducer(authenticatedState, action);
				
				expect(state.loading).toBe(false);
				expect(state.user).toBeNull();
				expect(state.accessToken).toBeNull();
				expect(state.isAuthenticated).toBe(false);
			});

			test('should handle logout.rejected', () => {
				const loadingState = { ...initialState, loading: true };
				const action = {
					type: logout.rejected.type,
					payload: 'Logout failed'
				};
				const state = authReducer(loadingState, action);
				
				expect(state.loading).toBe(false);
				expect(state.error).toBe('Logout failed');
			});
		});

		// Refresh Token
		describe('refreshToken', () => {
			test('should handle refreshToken.pending', () => {
				const action = { type: refreshToken.pending.type };
				const state = authReducer(initialState, action);
				
				expect(state.loading).toBe(true);
				expect(state.error).toBeNull();
			});

			test('should handle refreshToken.fulfilled', () => {
				const loadingState = { ...initialState, loading: true };
				const action = {
					type: refreshToken.fulfilled.type,
					payload: { accessToken: mockAccessToken }
				};
				const state = authReducer(loadingState, action);
				
				expect(state.loading).toBe(false);
				expect(state.accessToken).toBe(mockAccessToken);
				expect(state.isAuthenticated).toBe(true);
				expect(state.tokenRefreshAttempted).toBe(true);
			});

			test('should handle refreshToken.rejected', () => {
				const stateWithData = {
					...initialState,
					user: mockUser,
					accessToken: mockAccessToken,
					isAuthenticated: true,
					loading: true
				};
				
				const action = {
					type: refreshToken.rejected.type,
					payload: 'Token refresh failed'
				};
				const state = authReducer(stateWithData, action);
				
				expect(state.loading).toBe(false);
				expect(state.error).toBe('Token refresh failed');
				expect(state.isAuthenticated).toBe(false);
				expect(state.user).toBeNull();
				expect(state.accessToken).toBeNull();
				expect(state.tokenRefreshAttempted).toBe(true);
			});
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			auth: {
				user: mockUser,
				accessToken: mockAccessToken,
				isAuthenticated: true,
				loading: false,
				error: null,
				tokenRefreshAttempted: true
			}
		} as RootState;

		test('selectUser should return user', () => {
			const result = selectUser(mockState);
			expect(result).toEqual(mockUser);
		});

		test('selectIsAuthenticated should return authentication status', () => {
			const result = selectIsAuthenticated(mockState);
			expect(result).toBe(true);
		});

		test('selectAuthLoading should return loading state', () => {
			const result = selectAuthLoading(mockState);
			expect(result).toBe(false);
		});

		test('selectAuthError should return error state', () => {
			const result = selectAuthError(mockState);
			expect(result).toBeNull();
		});

		test('selectAccessToken should return access token', () => {
			const result = selectAccessToken(mockState);
			expect(result).toBe(mockAccessToken);
		});

		test('selectors should handle empty state', () => {
			const emptyState = { auth: initialState } as RootState;
			
			expect(selectUser(emptyState)).toBeNull();
			expect(selectIsAuthenticated(emptyState)).toBe(false);
			expect(selectAuthLoading(emptyState)).toBe(false);
			expect(selectAuthError(emptyState)).toBeNull();
			expect(selectAccessToken(emptyState)).toBeNull();
		});
	});
}); 