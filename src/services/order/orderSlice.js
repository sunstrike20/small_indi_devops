import { createSlice } from '@reduxjs/toolkit';
import { clearConstructor } from '../constructor/constructorSlice';
import { request } from '@utils/api';

const initialState = {
  order: null,
  loading: false,
  error: null
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    orderRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    orderSuccess: (state, action) => {
      state.order = action.payload;
      state.loading = false;
    },
    orderError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearOrder: (state) => {
      state.order = null;
    }
  }
});

export const { orderRequest, orderSuccess, orderError, clearOrder } = orderSlice.actions;
export const orderReducer = orderSlice.reducer;


export const selectOrder = (state) => state.order.order;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;


export const createOrder = (ingredients) => {
  return async (dispatch) => {
    dispatch(orderRequest());
    try {
      const data = await request('/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ingredients })
      });
      
      dispatch(orderSuccess(data.order));
      dispatch(clearConstructor());
    } catch (error) {
      dispatch(orderError(error.message));
    }
  };
};
