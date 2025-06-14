import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearConstructor } from '../constructor/constructorSlice';
import { request } from '@utils/api';
import { authRequest } from '@utils/auth-api';
import { Order, OrderState, RootState } from '@utils/types';
import { AppThunk, ApiResponse } from '@utils/store-types';

// Интерфейс для API ответа
interface OrderResponseData {
	success: boolean;
	order: Order;
	[key: string]: any;
}

const initialState: OrderState = {
	order: null,
	loading: false,
	error: null,
};

export const orderSlice = createSlice({
	name: 'order',
	initialState,
	reducers: {
		orderRequest: (state) => {
			state.loading = true;
			state.error = null;
		},
		orderSuccess: (state, action: PayloadAction<Order>) => {
			state.order = action.payload;
			state.loading = false;
		},
		orderError: (state, action: PayloadAction<string>) => {
			state.loading = false;
			state.error = action.payload;
		},
		clearOrder: (state) => {
			state.order = null;
		},
	},
});

export const { orderRequest, orderSuccess, orderError, clearOrder } =
	orderSlice.actions;
export const orderReducer = orderSlice.reducer;

export const selectOrder = (state: RootState): Order | null =>
	state.order.order;
export const selectOrderLoading = (state: RootState): boolean =>
	state.order.loading;
export const selectOrderError = (state: RootState): string | null =>
	state.order.error;

export const createOrder = (ingredients: string[]): AppThunk => {
	return async (dispatch, getState) => {
		const { auth } = getState();

		// Должны быть уверены, что пользователь авторизован
		// В компоненте BurgerConstructor уже есть проверка,
		// но добавим дополнительную проверку для надежности
		if (!auth.isAuthenticated || !auth.accessToken) {
			dispatch(orderError('Необходимо авторизоваться для оформления заказа'));
			return;
		}

		dispatch(orderRequest());
		try {
			const data = await authRequest<OrderResponseData>(
				'/orders',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					withAuth: true,
					body: JSON.stringify({ ingredients }),
				},
				dispatch,
				getState
			);

			if (data.success && data.order) {
				dispatch(orderSuccess(data.order));
				dispatch(clearConstructor());
			}
		} catch (error: any) {
			dispatch(orderError(error.message));
		}
	};
};
