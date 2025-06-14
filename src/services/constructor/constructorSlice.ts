import {
	createSlice,
	createSelector,
	PayloadAction,
	Reducer,
	AnyAction,
} from '@reduxjs/toolkit';
import {
	Ingredient,
	ConstructorIngredient,
	ConstructorState,
	RootState,
} from '@utils/types';
import { AppThunk } from '@utils/store-types';
import { v4 as uuidv4 } from 'uuid';

export const generateUuid = uuidv4;

const initialState: ConstructorState = {
	bun: null,
	ingredients: [],
};

// Интерфейс для действия перемещения ингредиента
interface MoveIngredientPayload {
	dragIndex: number;
	hoverIndex: number;
}

function createSafeConstructorReducer(): Reducer<ConstructorState, AnyAction> {
	const slice = createSlice({
		name: 'constructor',
		initialState,
		reducers: {
			setBun: (state, action: PayloadAction<Ingredient>) => {
				state.bun = action.payload;
			},

			addIngredient: (state, action: PayloadAction<ConstructorIngredient>) => {
				if (!Array.isArray(state.ingredients)) {
					state.ingredients = [];
				}
				state.ingredients.push(action.payload);
			},

			removeIngredient: (state, action: PayloadAction<string>) => {
				if (Array.isArray(state.ingredients)) {
					state.ingredients = state.ingredients.filter(
						(item) => item.uuid !== action.payload
					);
				}
			},

			moveIngredient: (state, action: PayloadAction<MoveIngredientPayload>) => {
				if (!Array.isArray(state.ingredients)) return;

				const { dragIndex, hoverIndex } = action.payload;
				const draggedItem = state.ingredients[dragIndex];

				if (draggedItem) {
					const newIngredients = [...state.ingredients];
					newIngredients.splice(dragIndex, 1);
					newIngredients.splice(hoverIndex, 0, draggedItem);
					state.ingredients = newIngredients;
				}
			},

			clear: (state) => {
				state.bun = null;
				state.ingredients = [];
			},
		},
	});

	return (state: ConstructorState | undefined, action: AnyAction) => {
		if (state === undefined) {
			return initialState;
		}

		if (typeof state === 'function') {
			return { ...initialState };
		}

		if (!state.ingredients) {
			return {
				...initialState,
				...state,
			};
		}

		return slice.reducer(state, action);
	};
}

const constructorSlice = createSlice({
	name: 'constructor',
	initialState,
	reducers: {
		setBun: (state, action: PayloadAction<Ingredient>) => {
			state.bun = action.payload;
		},

		addIngredient: (state, action: PayloadAction<ConstructorIngredient>) => {
			if (!Array.isArray(state.ingredients)) {
				state.ingredients = [];
			}
			state.ingredients.push(action.payload);
		},

		removeIngredient: (state, action: PayloadAction<string>) => {
			if (Array.isArray(state.ingredients)) {
				state.ingredients = state.ingredients.filter(
					(item) => item.uuid !== action.payload
				);
			}
		},

		moveIngredient: (state, action: PayloadAction<MoveIngredientPayload>) => {
			if (!Array.isArray(state.ingredients)) return;

			const { dragIndex, hoverIndex } = action.payload;
			const draggedItem = state.ingredients[dragIndex];

			if (draggedItem) {
				const newIngredients = [...state.ingredients];
				newIngredients.splice(dragIndex, 1);
				newIngredients.splice(hoverIndex, 0, draggedItem);
				state.ingredients = newIngredients;
			}
		},

		clear: (state) => {
			state.bun = null;
			state.ingredients = [];
		},
	},
});

export const { setBun, addIngredient, removeIngredient, moveIngredient } =
	constructorSlice.actions;

export const constructorReducer = createSafeConstructorReducer();

const getBun = (state: RootState): Ingredient | null => {
	if (!state || !state.constructor || typeof state.constructor === 'function') {
		return null;
	}
	return state.constructor.bun;
};

const getIngredientsList = (state: RootState): ConstructorIngredient[] => {
	if (!state || !state.constructor || typeof state.constructor === 'function') {
		return [];
	}
	return Array.isArray(state.constructor.ingredients)
		? state.constructor.ingredients
		: [];
};

export const selectBun = createSelector([getBun], (bun): Ingredient | null =>
	bun ? { ...bun } : null
);

export const selectIngredients = createSelector(
	[getIngredientsList],
	(ingredients): ConstructorIngredient[] => ingredients.slice()
);

export const selectTotalPrice = createSelector(
	[getBun, getIngredientsList],
	(bun, ingredients): number => {
		const bunPrice = bun ? bun.price * 2 : 0;
		const ingredientsPrice = Array.isArray(ingredients)
			? ingredients.reduce((sum, item) => sum + (item?.price || 0), 0)
			: 0;

		return bunPrice + ingredientsPrice;
	}
);

// Создаем улучшенную версию clearConstructor, которая проверяет
// авторизацию пользователя перед очисткой конструктора
export const clearConstructor = (): AppThunk => {
	return (dispatch, getState) => {
		const { auth } = getState();

		// Очищаем конструктор только если пользователь авторизован
		// Это позволит сохранить состояние конструктора при перенаправлении на страницу логина
		if (auth.isAuthenticated) {
			dispatch(constructorSlice.actions.clear());
		}
	};
};
