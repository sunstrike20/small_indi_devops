import { 
	ingredientsReducer, 
	getIngredientsRequest, 
	getIngredientsSuccess, 
	getIngredientsError,
	selectIngredients,
	selectIngredientsLoading,
	selectIngredientsError
} from './ingredientsSlice';
import { IngredientsState, Ingredient } from '@utils/types';
import { RootState } from '@utils/types';

// Мокаем данные для тестирования
const mockIngredient: Ingredient = {
	_id: '643d69a5c3f7b9001cfa093c',
	name: 'Краторная булка N-200i',
	type: 'bun',
	proteins: 80,
	fat: 24,
	carbohydrates: 53,
	calories: 420,
	price: 1255,
	image: 'https://code.s3.yandex.net/react/code/bun-02.png',
	image_mobile: 'https://code.s3.yandex.net/react/code/bun-02-mobile.png',
	image_large: 'https://code.s3.yandex.net/react/code/bun-02-large.png',
	__v: 0
};

const mockIngredients: Ingredient[] = [
	mockIngredient,
	{
		...mockIngredient,
		_id: '643d69a5c3f7b9001cfa093d',
		name: 'Соус Spicy-X',
		type: 'sauce'
	}
];

// Начальное состояние для тестов
const initialState: IngredientsState = {
	items: [],
	loading: false,
	error: null
};

describe('ingredientsSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(ingredientsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем редьюсеры
	describe('reducers', () => {
		test('should handle getIngredientsRequest', () => {
			const action = getIngredientsRequest();
			const state = ingredientsReducer(initialState, action);
			
			expect(state).toEqual({
				items: [],
				loading: true,
				error: null
			});
		});

		test('should handle getIngredientsSuccess', () => {
			const loadingState = {
				items: [],
				loading: true,
				error: null
			};
			
			const action = getIngredientsSuccess(mockIngredients);
			const state = ingredientsReducer(loadingState, action);
			
			expect(state).toEqual({
				items: mockIngredients,
				loading: false,
				error: null
			});
		});

		test('should handle getIngredientsError', () => {
			const loadingState = {
				items: [],
				loading: true,
				error: null
			};
			
			const errorMessage = 'Failed to fetch ingredients';
			const action = getIngredientsError(errorMessage);
			const state = ingredientsReducer(loadingState, action);
			
			expect(state).toEqual({
				items: [],
				loading: false,
				error: errorMessage
			});
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			ingredients: {
				items: mockIngredients,
				loading: false,
				error: null
			}
		} as RootState;

		test('selectIngredients should return ingredients array', () => {
			const result = selectIngredients(mockState);
			expect(result).toEqual(mockIngredients);
			expect(result).not.toBe(mockIngredients); // Проверяем что возвращается копия
		});

		test('selectIngredientsLoading should return loading state', () => {
			const result = selectIngredientsLoading(mockState);
			expect(result).toBe(false);
		});

		test('selectIngredientsError should return error state', () => {
			const result = selectIngredientsError(mockState);
			expect(result).toBe(null);
		});

		test('selectors should handle undefined state', () => {
			const undefinedState = {} as RootState;
			
			expect(selectIngredients(undefinedState)).toEqual([]);
			expect(selectIngredientsLoading(undefinedState)).toBe(false);
			expect(selectIngredientsError(undefinedState)).toBe(null);
		});
	});
}); 