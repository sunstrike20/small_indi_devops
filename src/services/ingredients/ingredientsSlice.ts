import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import { request } from '@utils/api';
import { Ingredient, IngredientsState, RootState } from '@utils/types';
import { AppThunk, ApiResponse } from '@utils/store-types';

// Обновленный интерфейс для API ответа, соответствующий структуре ответа сервера
interface IngredientsApiResponse {
	success: boolean;
	data: Ingredient[];
}

const initialState: IngredientsState = {
	items: [],
	loading: false,
	error: null,
};

export const ingredientsSlice = createSlice({
	name: 'ingredients',
	initialState,
	reducers: {
		getIngredientsRequest: (state) => {
			state.loading = true;
			state.error = null;
		},
		getIngredientsSuccess: (state, action: PayloadAction<Ingredient[]>) => {
			state.items = action.payload;
			state.loading = false;
		},
		getIngredientsError: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},
	},
});

export const {
	getIngredientsRequest,
	getIngredientsSuccess,
	getIngredientsError,
} = ingredientsSlice.actions;

export const ingredientsReducer = ingredientsSlice.reducer;

const getItems = (state: RootState): Ingredient[] =>
	state.ingredients?.items || [];
const getLoading = (state: RootState): boolean =>
	state.ingredients?.loading || false;
const getError = (state: RootState): string | null =>
	state.ingredients?.error || null;

export const selectIngredients = createSelector(
	[getItems],
	(items: Ingredient[]): Ingredient[] => [...items]
);

export const selectIngredientsLoading = createSelector(
	[getLoading],
	(loading: boolean): boolean => Boolean(loading)
);

export const selectIngredientsError = createSelector(
	[getError],
	(error: string | null): string | null => error
);

export const fetchIngredients = (): AppThunk => {
	return async (dispatch) => {
		dispatch(getIngredientsRequest());
		try {
			// Получаем данные с API
			const response = await request<IngredientsApiResponse>('/ingredients');

			// Проверяем успешность запроса и наличие данных
			if (response.success && response.data) {
				// Передаем массив ингредиентов напрямую
				dispatch(getIngredientsSuccess(response.data));
			} else {
				dispatch(getIngredientsError('Не удалось получить ингредиенты'));
			}
		} catch (error: any) {
			dispatch(getIngredientsError(error.message));
		}
	};
};
