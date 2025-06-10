import { createSlice, PayloadAction, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { request } from '../../utils/api';
import { authRequest } from '../../utils/auth-api';
import { RootState } from '../../utils/types';
import {
  WS_CONNECTION_START,
  WS_CONNECTION_SUCCESS,
  WS_CONNECTION_ERROR,
  WS_CONNECTION_CLOSED,
  WS_GET_MESSAGE,
  WS_CONNECTION_CLOSE,
  WS_ORDERS_USER_URL
} from '../websocket/websocketMiddleware';
import { FeedOrder, FeedData } from '../feed/feedSlice';

// Create action creators for WebSocket actions for user orders
const wsUserConnectionStart = createAction<{ url: string; token?: string }>(WS_CONNECTION_START);
const wsUserConnectionSuccess = createAction(WS_CONNECTION_SUCCESS);
const wsUserConnectionError = createAction<string>(WS_CONNECTION_ERROR);
const wsUserConnectionClosed = createAction(WS_CONNECTION_CLOSED);
const wsUserGetMessage = createAction<any>(WS_GET_MESSAGE);

// Order history state interface
export interface OrderHistoryState {
  orders: FeedOrder[];
  total: number;
  totalToday: number;
  wsConnected: boolean;
  loading: boolean;
  error: string | null;
  dataReceived: boolean; // Flag to indicate if we've received data at least once
}

// Initial state
const initialState: OrderHistoryState = {
  orders: [],
  total: 0,
  totalToday: 0,
  wsConnected: false,
  loading: false,
  error: null,
  dataReceived: false,
};

// Async thunk to get individual order by number with auth
export const getUserOrderByNumber = createAsyncThunk<
  FeedOrder,
  number,
  { rejectValue: string; state: RootState; dispatch: any }
>(
  'orderHistory/getUserOrderByNumber',
  async (orderNumber, { rejectWithValue, getState, dispatch }) => {
    try {
      const { auth } = getState();
      if (!auth.accessToken) {
        return rejectWithValue('No access token');
      }

      const response = await authRequest<{ success: boolean; orders: FeedOrder[] }>(
        `/orders/${orderNumber}`,
        { method: 'GET', withAuth: true },
        dispatch,
        getState
      );
      
      if (response.success && response.orders.length > 0) {
        return response.orders[0];
      }
      
      return rejectWithValue('Order not found');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch order');
    }
  }
);

// Order history slice
const orderHistorySlice = createSlice({
  name: 'orderHistory',
  initialState,
  reducers: {
    // Clear order history data
    clearOrderHistory: (state) => {
      state.orders = [];
      state.total = 0;
      state.totalToday = 0;
      state.error = null;
      state.dataReceived = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // WebSocket connection states
    builder
      .addCase(wsUserConnectionStart, (state) => {
        state.loading = true;
        state.error = null;
        state.wsConnected = false;
      })
      .addCase(wsUserConnectionSuccess, (state) => {
        state.loading = false;
        state.wsConnected = true;
        state.error = null;
      })
      .addCase(wsUserConnectionError, (state, action) => {
        state.loading = false;
        state.wsConnected = false;
        state.error = action.payload;
      })
      .addCase(wsUserConnectionClosed, (state) => {
        state.wsConnected = false;
        state.loading = false;
      })
      .addCase(wsUserGetMessage, (state, action) => {
        const data = action.payload as FeedData;
        console.log('[OrderHistory] WebSocket message received:', {
          success: data.success,
          ordersCount: data.orders?.length || 0,
          total: data.total,
          totalToday: data.totalToday,
          firstOrderRaw: data.orders?.[0] || null,
          rawPayload: action.payload
        });
        
        if (data.success) {
          state.orders = data.orders;
          state.total = data.total;
          state.totalToday = data.totalToday;
          state.error = null;
          state.dataReceived = true; // Mark that we've received data
          
          console.log('[OrderHistory] State updated:', {
            newOrdersCount: state.orders.length,
            firstOrder: state.orders[0]?.number || 'none',
            firstOrderIngredients: state.orders[0]?.ingredients || [],
            firstOrderDetails: {
              _id: state.orders[0]?._id,
              number: state.orders[0]?.number,
              name: state.orders[0]?.name,
              status: state.orders[0]?.status,
              createdAt: state.orders[0]?.createdAt
            },
            dataReceived: state.dataReceived
          });
        }
      });

    // Get order by number
    builder
      .addCase(getUserOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        // Add order to the list if it's not already there
        const existingOrderIndex = state.orders.findIndex(
          (order: FeedOrder) => order.number === action.payload.number
        );
        
        if (existingOrderIndex === -1) {
          state.orders.unshift(action.payload);
        } else {
          state.orders[existingOrderIndex] = action.payload;
        }
      })
      .addCase(getUserOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch order';
      });
  },
});

// Action creators
export const { clearOrderHistory, clearError } = orderHistorySlice.actions;

// Selectors
export const selectOrderHistoryOrders = (state: RootState) => state.orderHistory.orders;
export const selectOrderHistoryTotal = (state: RootState) => state.orderHistory.total;
export const selectOrderHistoryTotalToday = (state: RootState) => state.orderHistory.totalToday;
export const selectOrderHistoryWsConnected = (state: RootState) => state.orderHistory.wsConnected;
export const selectOrderHistoryLoading = (state: RootState) => state.orderHistory.loading;
export const selectOrderHistoryError = (state: RootState) => state.orderHistory.error;
export const selectOrderHistoryDataReceived = (state: RootState) => state.orderHistory.dataReceived;

// Derived selectors
export const selectOrderHistoryOrderByNumber = (orderNumber: number) => (state: RootState) => {
  return state.orderHistory.orders.find((order: FeedOrder) => order.number === orderNumber);
};

// Helper action creators for WebSocket with authentication
export const connectToUserOrders = (accessToken: string) => ({
  type: WS_CONNECTION_START,
  payload: { 
    url: WS_ORDERS_USER_URL, 
    token: accessToken.replace('Bearer ', '') // Remove Bearer prefix for WebSocket
  }
});

export const disconnectFromUserOrders = () => ({
  type: WS_CONNECTION_CLOSE
});

export const orderHistoryReducer = orderHistorySlice.reducer; 