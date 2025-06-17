import {
	orderHistoryReducer,
	clearOrderHistory,
	clearError,
	getUserOrderByNumber,
	selectOrderHistoryOrders,
	selectOrderHistoryTotal,
	selectOrderHistoryTotalToday,
	selectOrderHistoryWsConnected,
	selectOrderHistoryLoading,
	selectOrderHistoryError,
	selectOrderHistoryDataReceived,
	selectOrderHistoryOrderByNumber,
	OrderHistoryState
} from './orderHistorySlice';
import { FeedOrder } from '../feed/feedSlice';
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
jest.mock('../../utils/auth-api');

// Мокаем console.log для тестов
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

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

const mockUserOrder: FeedOrder = {
	_id: '64e5f9e5bb0c9e3d65b74e57',
	ingredients: ['643d69a5c3f7b9001cfa093d'],
	status: 'pending',
	number: 12346,
	createdAt: '2023-08-23T11:00:00.000Z',
	updatedAt: '2023-08-23T11:00:30.000Z',
	name: 'Мой заказ'
};

const mockFeedData = {
	success: true,
	orders: [mockUserOrder, mockOrder],
	total: 50,
	totalToday: 5
};

// Начальное состояние для тестов
const initialState: OrderHistoryState = {
	orders: [],
	total: 0,
	totalToday: 0,
	wsConnected: false,
	loading: false,
	error: null,
	dataReceived: false
};

describe('orderHistorySlice', () => {
	beforeEach(() => {
		consoleSpy.mockClear();
	});

	afterAll(() => {
		consoleSpy.mockRestore();
	});

	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(orderHistoryReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем синхронные редьюсеры
	describe('reducers', () => {
		test('should handle clearOrderHistory', () => {
			const stateWithData = {
				...initialState,
				orders: [mockUserOrder],
				total: 50,
				totalToday: 5,
				error: 'Some error',
				dataReceived: true
			};
			
			const action = clearOrderHistory();
			const state = orderHistoryReducer(stateWithData, action);
			
			expect(state.orders).toEqual([]);
			expect(state.total).toBe(0);
			expect(state.totalToday).toBe(0);
			expect(state.error).toBeNull();
			expect(state.dataReceived).toBe(false);
		});

		test('should handle clearError', () => {
			const stateWithError = {
				...initialState,
				error: 'Some error'
			};
			
			const action = clearError();
			const state = orderHistoryReducer(stateWithError, action);
			
			expect(state.error).toBeNull();
		});
	});

	// Тестируем WebSocket экшены
	describe('WebSocket actions', () => {
		test('should handle WS_CONNECTION_START', () => {
			const action = { type: WS_CONNECTION_START, payload: { url: 'ws://test', token: 'token' } };
			const state = orderHistoryReducer(initialState, action);
			
			expect(state.loading).toBe(true);
			expect(state.error).toBeNull();
			expect(state.wsConnected).toBe(false);
		});

		test('should handle WS_CONNECTION_SUCCESS', () => {
			const loadingState = { ...initialState, loading: true };
			const action = { type: WS_CONNECTION_SUCCESS };
			const state = orderHistoryReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.wsConnected).toBe(true);
			expect(state.error).toBeNull();
		});

		test('should handle WS_CONNECTION_ERROR', () => {
			const action = { type: WS_CONNECTION_ERROR, payload: 'Connection failed' };
			const state = orderHistoryReducer(initialState, action);
			
			expect(state.loading).toBe(false);
			expect(state.wsConnected).toBe(false);
			expect(state.error).toBe('Connection failed');
		});

		test('should handle WS_CONNECTION_CLOSED', () => {
			const connectedState = { ...initialState, wsConnected: true };
			const action = { type: WS_CONNECTION_CLOSED };
			const state = orderHistoryReducer(connectedState, action);
			
			expect(state.wsConnected).toBe(false);
			expect(state.loading).toBe(false);
		});

		test('should handle WS_GET_MESSAGE with valid data', () => {
			const action = { type: WS_GET_MESSAGE, payload: mockFeedData };
			const state = orderHistoryReducer(initialState, action);
			
			expect(state.orders).toEqual(mockFeedData.orders);
			expect(state.total).toBe(mockFeedData.total);
			expect(state.totalToday).toBe(mockFeedData.totalToday);
			expect(state.error).toBeNull();
			expect(state.dataReceived).toBe(true);
		});

		test('should not update state when WS_GET_MESSAGE has invalid data', () => {
			const invalidData = { success: false, orders: [], total: 0, totalToday: 0 };
			const action = { type: WS_GET_MESSAGE, payload: invalidData };
			const state = orderHistoryReducer(initialState, action);
			
			expect(state).toEqual(initialState);
		});
	});

	// Тестируем async thunks
	describe('async thunks', () => {
		test('should handle getUserOrderByNumber.pending', () => {
			const action = { type: getUserOrderByNumber.pending.type };
			const state = orderHistoryReducer(initialState, action);
			
			expect(state.loading).toBe(true);
			expect(state.error).toBeNull();
		});

		test('should handle getUserOrderByNumber.fulfilled with new order', () => {
			const loadingState = { ...initialState, loading: true };
			const action = {
				type: getUserOrderByNumber.fulfilled.type,
				payload: mockUserOrder
			};
			const state = orderHistoryReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.orders).toContain(mockUserOrder);
			expect(state.orders[0]).toEqual(mockUserOrder);
		});

		test('should handle getUserOrderByNumber.fulfilled with existing order', () => {
			const stateWithOrder = {
				...initialState,
				orders: [mockUserOrder],
				loading: true
			};
			
			const updatedOrder = { ...mockUserOrder, name: 'Updated name' };
			const action = {
				type: getUserOrderByNumber.fulfilled.type,
				payload: updatedOrder
			};
			const state = orderHistoryReducer(stateWithOrder, action);
			
			expect(state.loading).toBe(false);
			expect(state.orders).toHaveLength(1);
			expect(state.orders[0]).toEqual(updatedOrder);
		});

		test('should handle getUserOrderByNumber.rejected', () => {
			const loadingState = { ...initialState, loading: true };
			const action = {
				type: getUserOrderByNumber.rejected.type,
				payload: 'Order not found'
			};
			const state = orderHistoryReducer(loadingState, action);
			
			expect(state.loading).toBe(false);
			expect(state.error).toBe('Order not found');
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			orderHistory: {
				orders: [mockUserOrder, mockOrder],
				total: 50,
				totalToday: 5,
				wsConnected: true,
				loading: false,
				error: null,
				dataReceived: true
			}
		} as RootState;

		test('selectOrderHistoryOrders should return orders array', () => {
			const result = selectOrderHistoryOrders(mockState);
			expect(result).toEqual([mockUserOrder, mockOrder]);
		});

		test('selectOrderHistoryTotal should return total', () => {
			const result = selectOrderHistoryTotal(mockState);
			expect(result).toBe(50);
		});

		test('selectOrderHistoryTotalToday should return totalToday', () => {
			const result = selectOrderHistoryTotalToday(mockState);
			expect(result).toBe(5);
		});

		test('selectOrderHistoryWsConnected should return connection status', () => {
			const result = selectOrderHistoryWsConnected(mockState);
			expect(result).toBe(true);
		});

		test('selectOrderHistoryLoading should return loading state', () => {
			const result = selectOrderHistoryLoading(mockState);
			expect(result).toBe(false);
		});

		test('selectOrderHistoryError should return error state', () => {
			const result = selectOrderHistoryError(mockState);
			expect(result).toBeNull();
		});

		test('selectOrderHistoryDataReceived should return dataReceived flag', () => {
			const result = selectOrderHistoryDataReceived(mockState);
			expect(result).toBe(true);
		});

		test('selectOrderHistoryOrderByNumber should return specific order', () => {
			const selector = selectOrderHistoryOrderByNumber(12346);
			const result = selector(mockState);
			
			expect(result).toEqual(mockUserOrder);
		});

		test('selectOrderHistoryOrderByNumber should return undefined for non-existent order', () => {
			const selector = selectOrderHistoryOrderByNumber(99999);
			const result = selector(mockState);
			
			expect(result).toBeUndefined();
		});
	});
}); 