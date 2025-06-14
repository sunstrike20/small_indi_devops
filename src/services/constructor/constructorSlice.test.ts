import {
	constructorReducer,
	setBun,
	addIngredient,
	removeIngredient,
	moveIngredient,
	selectBun,
	selectIngredients,
	selectTotalPrice
} from './constructorSlice';
import { ConstructorState, Ingredient, ConstructorIngredient, RootState } from '@utils/types';

// Мокаем данные для тестирования
const mockBun: Ingredient = {
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

const mockIngredient: Ingredient = {
	_id: '643d69a5c3f7b9001cfa0941',
	name: 'Биокотлета из марсианской Магнолии',
	type: 'main',
	proteins: 420,
	fat: 142,
	carbohydrates: 242,
	calories: 4242,
	price: 424,
	image: 'https://code.s3.yandex.net/react/code/meat-01.png',
	image_mobile: 'https://code.s3.yandex.net/react/code/meat-01-mobile.png',
	image_large: 'https://code.s3.yandex.net/react/code/meat-01-large.png',
	__v: 0
};

const mockConstructorIngredient: ConstructorIngredient = {
	...mockIngredient,
	uuid: 'test-uuid-1'
};

const mockConstructorIngredient2: ConstructorIngredient = {
	...mockIngredient,
	_id: '643d69a5c3f7b9001cfa0942',
	name: 'Соус Spicy-X',
	type: 'sauce',
	price: 90,
	uuid: 'test-uuid-2'
};

// Начальное состояние для тестов
const initialState: ConstructorState = {
	bun: null,
	ingredients: []
};

describe('constructorSlice', () => {
	// Тестируем начальное состояние
	describe('initial state', () => {
		test('should return the initial state', () => {
			expect(constructorReducer(undefined, { type: 'unknown' })).toEqual(initialState);
		});
	});

	// Тестируем редьюсеры
	describe('reducers', () => {
		test('should handle setBun', () => {
			const action = setBun(mockBun);
			const state = constructorReducer(initialState, action);
			
			expect(state).toEqual({
				bun: mockBun,
				ingredients: []
			});
		});

		test('should replace existing bun when setting new bun', () => {
			const stateWithBun = {
				bun: mockBun,
				ingredients: []
			};
			
			const newBun = { ...mockBun, _id: 'new-bun-id', name: 'Новая булка' };
			const action = setBun(newBun);
			const state = constructorReducer(stateWithBun, action);
			
			expect(state.bun).toEqual(newBun);
		});

		test('should handle addIngredient', () => {
			const action = addIngredient(mockConstructorIngredient);
			const state = constructorReducer(initialState, action);
			
			expect(state).toEqual({
				bun: null,
				ingredients: [mockConstructorIngredient]
			});
		});

		test('should add multiple ingredients', () => {
			const stateWithOneIngredient = {
				bun: null,
				ingredients: [mockConstructorIngredient]
			};
			
			const action = addIngredient(mockConstructorIngredient2);
			const state = constructorReducer(stateWithOneIngredient, action);
			
			expect(state.ingredients).toHaveLength(2);
			expect(state.ingredients).toEqual([mockConstructorIngredient, mockConstructorIngredient2]);
		});

		test('should handle removeIngredient', () => {
			const stateWithIngredients = {
				bun: null,
				ingredients: [mockConstructorIngredient, mockConstructorIngredient2]
			};
			
			const action = removeIngredient('test-uuid-1');
			const state = constructorReducer(stateWithIngredients, action);
			
			expect(state.ingredients).toHaveLength(1);
			expect(state.ingredients[0]).toEqual(mockConstructorIngredient2);
		});

		test('should not remove ingredient with non-existent uuid', () => {
			const stateWithIngredients = {
				bun: null,
				ingredients: [mockConstructorIngredient]
			};
			
			const action = removeIngredient('non-existent-uuid');
			const state = constructorReducer(stateWithIngredients, action);
			
			expect(state.ingredients).toHaveLength(1);
			expect(state.ingredients[0]).toEqual(mockConstructorIngredient);
		});

		test('should handle moveIngredient', () => {
			const stateWithIngredients = {
				bun: null,
				ingredients: [mockConstructorIngredient, mockConstructorIngredient2]
			};
			
			const action = moveIngredient({ dragIndex: 0, hoverIndex: 1 });
			const state = constructorReducer(stateWithIngredients, action);
			
			expect(state.ingredients).toEqual([mockConstructorIngredient2, mockConstructorIngredient]);
		});

		test('should handle clear', () => {
			const stateWithData = {
				bun: mockBun,
				ingredients: [mockConstructorIngredient, mockConstructorIngredient2]
			};
			
			const action = { type: 'constructor/clear' };
			const state = constructorReducer(stateWithData, action);
			
			expect(state).toEqual(initialState);
		});
	});

	// Тестируем селекторы
	describe('selectors', () => {
		const mockState: RootState = {
			constructor: {
				bun: mockBun,
				ingredients: [mockConstructorIngredient, mockConstructorIngredient2]
			}
		} as RootState;

		test('selectBun should return bun', () => {
			const result = selectBun(mockState);
			expect(result).toEqual(mockBun);
			expect(result).not.toBe(mockBun); // Проверяем что возвращается копия
		});

		test('selectBun should return null when no bun', () => {
			const stateWithoutBun = {
				...mockState,
				constructor: { ...mockState.constructor, bun: null }
			};
			
			const result = selectBun(stateWithoutBun);
			expect(result).toBeNull();
		});

		test('selectIngredients should return ingredients array', () => {
			const result = selectIngredients(mockState);
			expect(result).toEqual([mockConstructorIngredient, mockConstructorIngredient2]);
			expect(result).not.toBe(mockState.constructor.ingredients); // Проверяем что возвращается копия
		});

		test('selectTotalPrice should calculate total price correctly', () => {
			const result = selectTotalPrice(mockState);
			// Булка умножается на 2 + цены ингредиентов
			const expectedPrice = mockBun.price * 2 + mockConstructorIngredient.price + mockConstructorIngredient2.price;
			expect(result).toBe(expectedPrice);
		});

		test('selectTotalPrice should handle missing bun', () => {
			const stateWithoutBun = {
				...mockState,
				constructor: { ...mockState.constructor, bun: null }
			};
			
			const result = selectTotalPrice(stateWithoutBun);
			const expectedPrice = mockConstructorIngredient.price + mockConstructorIngredient2.price;
			expect(result).toBe(expectedPrice);
		});

		test('selectors should handle undefined state', () => {
			const undefinedState = {} as RootState;
			
			expect(selectBun(undefinedState)).toBeNull();
			expect(selectIngredients(undefinedState)).toEqual([]);
			expect(selectTotalPrice(undefinedState)).toBe(0);
		});
	});
}); 