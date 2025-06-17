import {
	feedReducer,
	clearFeed,
	clearError,
	getOrderByNumber,
	selectFeedOrders,
	selectFeedTotal,
	selectFeedTotalToday,
	selectFeedWsConnected,
	selectFeedLoading,
	selectFeedError,
	selectFeedOrdersByStatus,
	selectFeedOrderByNumber,
	FeedState,
	FeedOrder
} from './feedSlice';
import { RootState } from '@utils/types';
import {
  WS_CONNECTION_START,
  WS_CONNECTION_SUCCESS,
  WS_CONNECTION_ERROR,
  WS_CONNECTION_CLOSED,
  WS_GET_MESSAGE
} from '../websocket/websocketMiddleware';

// Мокаем зависимости
jest.mock('../../utils/api');

// Мокаем данные для тестирования
const mockOrder: FeedOrder = {
	_id: '64e5f9e5bb0c9e3d65b74e56',
	ingredients: ['643d69a5c3f7b9001cfa093c', '643d69a5c3f7b9001cfa0941'],
	status: 'done',
	number: 12345,
	createdAt: '2023-08-23T10:30:00.000Z',
	updatedAt: '2023-08-23T10:30:30.000Z',
	name: 'Краторный бургер'
};

const mockPendingOrder: FeedOrder = {
	_id: '64e5f9e5bb0c9e3d65b74e57',
	ingredients: ['643d69a5c3f7b9001cfa093d'],
	status: 'pending',
	number: 12346,
	createdAt: '2023-08-23T11:00:00.000Z',
	updatedAt: '2023-08-23T11:00:30.000Z',
	name: 'Соусный бургер'
};

const mockFeedData = {
	success: true,
	orders: [mockOrder, mockPendingOrder],
	total: 100,
	totalToday: 10
};

// Начальное состояние для тестов
const initialState: FeedState = {
	orders: [],
	total: 0,
	totalToday: 0,
	wsConnected: false,
	loading: false,
	error: null
};

describe('feedSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(feedReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем синхронные редьюсеры
	describe('reducers', () => {
		test('should handle clearFeed', () => {
			const stateWithData = {
				...initialState,
				orders: [mockOrder],
				total: 100,
				totalToday: 10,
				error: 'Some error'
			};
			
			const action = clearFeed();
			const state = feedReducer(stateWithData, action);
			
			expect(state.orders).toEqual([]);
			expect(state.total).toBe(0);
			expect(state.totalToday).toBe(0);
			expect(state.error).toBeNull();
		});

		test('should handle clearError', () => {
			const stateWithError = {
				...initialState,
				error: 'Some error'
			};
			
			const action = clearError();
			const state = feedReducer(stateWithError, action);
			
			expect(state.error).toBeNull();
		});
	});

	// Тестируем WebSocket экшены
	describe('WebSocket actions', () => {
		test('should handle WS_CONNECTION_START', () => {
			const action = { type: WS_CONNECTION_START, payload: { url: 'ws://test' } };
			const state = feedReducer(initialState, action);
			
			expect(state.loading).toBe(true);
			expect(state.error).toBeNull();
			expect(state.wsConnected).toBe(false);
		});

		test('should handle WS_CONNECTION_SUCCESS', () => {
			const loadingState = { ...initialState, loading: true };
			const action = { type: WS_CONNECTION_SUCCESS };
			const state = feedReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.wsConnected).toBe(true);
			expect(state.error).toBeNull();
		});

		test('should handle WS_CONNECTION_ERROR', () => {
			const action = { type: WS_CONNECTION_ERROR, payload: 'Connection failed' };
			const state = feedReducer(initialState, action);
			
			expect(state.loading).toBe(false);
			expect(state.wsConnected).toBe(false);
			expect(state.error).toBe('Connection failed');
		});

		test('should handle WS_CONNECTION_CLOSED', () => {
			const connectedState = { ...initialState, wsConnected: true };
			const action = { type: WS_CONNECTION_CLOSED };
			const state = feedReducer(connectedState, action);
			
			expect(state.wsConnected).toBe(false);
			expect(state.loading).toBe(false);
		});

		test('should handle WS_GET_MESSAGE with valid data', () => {
			const action = { type: WS_GET_MESSAGE, payload: mockFeedData };
			const state = feedReducer(initialState, action);
			
			expect(state.orders).toEqual(mockFeedData.orders);
			expect(state.total).toBe(mockFeedData.total);
			expect(state.totalToday).toBe(mockFeedData.totalToday);
			expect(state.error).toBeNull();
		});

		test('should not update state when WS_GET_MESSAGE has invalid data', () => {
			const invalidData = { success: false, orders: [], total: 0, totalToday: 0 };
			const action = { type: WS_GET_MESSAGE, payload: invalidData };
			const state = feedReducer(initialState, action);
			
			expect(state).toEqual(initialState);
		});
	});

	// Тестируем async thunks
	describe('async thunks', () => {
		test('should handle getOrderByNumber.pending', () => {
			const action = { type: getOrderByNumber.pending.type };
			const state = feedReducer(initialState, action);
			
			expect(state.loading).toBe(true);
			expect(state.error).toBeNull();
		});

		test('should handle getOrderByNumber.fulfilled with new order', () => {
			const loadingState = { ...initialState, loading: true };
			const action = {
				type: getOrderByNumber.fulfilled.type,
				payload: mockOrder
			};
			const state = feedReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.orders).toContain(mockOrder);
			expect(state.orders[0]).toEqual(mockOrder);
		});

		test('should handle getOrderByNumber.fulfilled with existing order', () => {
			const stateWithOrder = {
				...initialState,
				orders: [mockOrder],
				loading: true
			};
			
			const updatedOrder = { ...mockOrder, name: 'Updated name' };
			const action = {
				type: getOrderByNumber.fulfilled.type,
				payload: updatedOrder
			};
			const state = feedReducer(stateWithOrder, action);
			
			expect(state.loading).toBe(false);
			expect(state.orders).toHaveLength(1);
			expect(state.orders[0]).toEqual(updatedOrder);
		});

		test('should handle getOrderByNumber.rejected', () => {
			const loadingState = { ...initialState, loading: true };
			const action = {
				type: getOrderByNumber.rejected.type,
				payload: 'Order not found'
			};
			const state = feedReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.error).toBe('Order not found');
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			feed: {
				orders: [mockOrder, mockPendingOrder],
				total: 100,
				totalToday: 10,
				wsConnected: true,
				loading: false,
				error: null
			}
		} as RootState;

		test('selectFeedOrders should return orders array', () => {
			const result = selectFeedOrders(mockState);
			expect(result).toEqual([mockOrder, mockPendingOrder]);
		});

		test('selectFeedTotal should return total', () => {
			const result = selectFeedTotal(mockState);
			expect(result).toBe(100);
		});

		test('selectFeedTotalToday should return totalToday', () => {
			const result = selectFeedTotalToday(mockState);
			expect(result).toBe(10);
		});

		test('selectFeedWsConnected should return connection status', () => {
			const result = selectFeedWsConnected(mockState);
			expect(result).toBe(true);
		});

		test('selectFeedLoading should return loading state', () => {
			const result = selectFeedLoading(mockState);
			expect(result).toBe(false);
		});

		test('selectFeedError should return error state', () => {
			const result = selectFeedError(mockState);
			expect(result).toBeNull();
		});

		test('selectFeedOrdersByStatus should group orders by status', () => {
			const result = selectFeedOrdersByStatus(mockState);
			
			expect(result.done).toEqual([mockOrder]);
			expect(result.pending).toEqual([mockPendingOrder]);
		});

		test('selectFeedOrderByNumber should return specific order', () => {
			const selector = selectFeedOrderByNumber(12345);
			const result = selector(mockState);
			
			expect(result).toEqual(mockOrder);
		});

		test('selectFeedOrderByNumber should return undefined for non-existent order', () => {
			const selector = selectFeedOrderByNumber(99999);
			const result = selector(mockState);
			
			expect(result).toBeUndefined();
		});
	});
}); 