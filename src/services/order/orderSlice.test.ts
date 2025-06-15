import {
	orderReducer,
	orderRequest,
	orderSuccess,
	orderError,
	clearOrder,
	selectOrder,
	selectOrderLoading,
	selectOrderError
} from './orderSlice';
import { OrderState, Order, RootState } from '@utils/types';

// Мокаем зависимости
jest.mock('@utils/api');
jest.mock('@utils/auth-api');

// Мокаем данные для тестирования
const mockOrder: Order = {
	_id: '64e5f9e5bb0c9e3d65b74e56',
	status: 'done',
	name: 'Краторный бургер',
	createdAt: '2023-08-23T10:30:00.000Z',
	updatedAt: '2023-08-23T10:30:30.000Z',
	number: 12345,
	ingredients: ['643d69a5c3f7b9001cfa093c', '643d69a5c3f7b9001cfa0941']
};

// Начальное состояние для тестов
const initialState: OrderState = {
	order: null,
	loading: false,
	error: null
};

describe('orderSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(orderReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем редьюсеры
	describe('reducers', () => {
		test('should handle orderRequest', () => {
			const action = orderRequest();
			const state = orderReducer(initialState, action);
			
			expect(state).toEqual({
				order: null,
				loading: true,
				error: null
			});
		});

		test('should handle orderRequest and clear previous error', () => {
			const stateWithError = {
				...initialState,
				error: 'Previous error'
			};
			
			const action = orderRequest();
			const state = orderReducer(stateWithError, action);
			
			expect(state).toEqual({
				order: null,
				loading: true,
				error: null
			});
		});

		test('should handle orderSuccess', () => {
			const loadingState = {
				...initialState,
				loading: true
			};
			
			const action = orderSuccess(mockOrder);
			const state = orderReducer(loadingState, action);
			
			expect(state).toEqual({
				order: mockOrder,
				loading: false,
				error: null
			});
		});

		test('should handle orderError', () => {
			const loadingState = {
				...initialState,
				loading: true
			};
			
			const errorMessage = 'Failed to create order';
			const action = orderError(errorMessage);
			const state = orderReducer(loadingState, action);
			
			expect(state).toEqual({
				order: null,
				loading: false,
				error: errorMessage
			});
		});

		test('should handle clearOrder', () => {
			const stateWithOrder = {
				...initialState,
				order: mockOrder
			};
			
			const action = clearOrder();
			const state = orderReducer(stateWithOrder, action);
			
			expect(state).toEqual({
				...initialState,
				order: null
			});
		});

		test('should handle clearOrder when no order exists', () => {
			const action = clearOrder();
			const state = orderReducer(initialState, action);
			
			expect(state).toEqual(initialState);
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			order: {
				order: mockOrder,
				loading: false,
				error: null
			}
		} as RootState;

		test('selectOrder should return order', () => {
			const result = selectOrder(mockState);
			expect(result).toEqual(mockOrder);
		});

		test('selectOrder should return null when no order', () => {
			const stateWithoutOrder = {
				...mockState,
				order: { ...mockState.order, order: null }
			};
			
			const result = selectOrder(stateWithoutOrder);
			expect(result).toBeNull();
		});

		test('selectOrderLoading should return loading state', () => {
			const result = selectOrderLoading(mockState);
			expect(result).toBe(false);
			
			const loadingState = {
				...mockState,
				order: { ...mockState.order, loading: true }
			};
			
			const loadingResult = selectOrderLoading(loadingState);
			expect(loadingResult).toBe(true);
		});

		test('selectOrderError should return error state', () => {
			const result = selectOrderError(mockState);
			expect(result).toBeNull();
			
			const errorState = {
				...mockState,
				order: { ...mockState.order, error: 'Some error' }
			};
			
			const errorResult = selectOrderError(errorState);
			expect(errorResult).toBe('Some error');
		});
	});
}); 