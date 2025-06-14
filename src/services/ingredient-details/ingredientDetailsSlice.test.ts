import {
	ingredientDetailsReducer,
	setCurrentIngredient,
	clearCurrentIngredient,
	selectCurrentIngredient
} from './ingredientDetailsSlice';
import { IngredientDetailsState, Ingredient, RootState } from '@utils/types';

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

// Начальное состояние для тестов
const initialState: IngredientDetailsState = {
	currentIngredient: null
};

describe('ingredientDetailsSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(ingredientDetailsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем редьюсеры
	describe('reducers', () => {
		test('should handle setCurrentIngredient', () => {
			const action = setCurrentIngredient(mockIngredient);
			const state = ingredientDetailsReducer(initialState, action);
			
			expect(state.currentIngredient).toEqual(mockIngredient);
		});

		test('should replace existing ingredient when setting new one', () => {
			const stateWithIngredient = {
				currentIngredient: mockIngredient
			};
			
			const newIngredient = { 
				...mockIngredient, 
				_id: 'new-ingredient-id', 
				name: 'Новый ингредиент' 
			};
			
			const action = setCurrentIngredient(newIngredient);
			const state = ingredientDetailsReducer(stateWithIngredient, action);
			
			expect(state.currentIngredient).toEqual(newIngredient);
		});

		test('should handle clearCurrentIngredient', () => {
			const stateWithIngredient = {
				currentIngredient: mockIngredient
			};
			
			const action = clearCurrentIngredient();
			const state = ingredientDetailsReducer(stateWithIngredient, action);
			
			expect(state.currentIngredient).toBeNull();
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		test('selectCurrentIngredient should return current ingredient', () => {
			const mockState: RootState = {
				ingredientDetails: {
					currentIngredient: mockIngredient
				}
			} as RootState;
			
			const result = selectCurrentIngredient(mockState);
			expect(result).toEqual(mockIngredient);
		});

		test('selectCurrentIngredient should return null when no ingredient', () => {
			const mockState: RootState = {
				ingredientDetails: {
					currentIngredient: null
				}
			} as RootState;
			
			const result = selectCurrentIngredient(mockState);
			expect(result).toBeNull();
		});

		test('selectCurrentIngredient should handle undefined state', () => {
			const undefinedState = {} as RootState;
			
			const result = selectCurrentIngredient(undefinedState);
			expect(result).toBeNull();
		});
	});
}); 