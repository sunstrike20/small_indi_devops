import { createSlice, PayloadAction, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { request } from '../../utils/api';
import { RootState } from '../../utils/types';
import {
  WS_CONNECTION_START,
  WS_CONNECTION_SUCCESS,
  WS_CONNECTION_ERROR,
  WS_CONNECTION_CLOSED,
  WS_GET_MESSAGE,
  WS_CONNECTION_CLOSE,
  WS_ORDERS_ALL_URL
} from '../websocket/websocketMiddleware';

// Create action creators for WebSocket actions
const wsConnectionStart = createAction<{ url: string; token?: string }>(WS_CONNECTION_START);
const wsConnectionSuccess = createAction(WS_CONNECTION_SUCCESS);
const wsConnectionError = createAction<string>(WS_CONNECTION_ERROR);
const wsConnectionClosed = createAction(WS_CONNECTION_CLOSED);
const wsGetMessage = createAction<any>(WS_GET_MESSAGE);

// Order interface from API response
export interface FeedOrder {
  _id: string;
  ingredients: string[];
  status: 'created' | 'pending' | 'done';
  number: number;
  createdAt: string;
  updatedAt: string;
  name?: string;
}

// Feed data interface from WebSocket
export interface FeedData {
  success: boolean;
  orders: FeedOrder[];
  total: number;
  totalToday: number;
}

// Feed state interface
export interface FeedState {
  orders: FeedOrder[];
  total: number;
  totalToday: number;
  wsConnected: boolean;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: FeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  wsConnected: false,
  loading: false,
  error: null,
};

// Async thunk to get individual order by number
export const getOrderByNumber = createAsyncThunk<
  FeedOrder,
  number,
  { rejectValue: string }
>(
  'feed/getOrderByNumber',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const response = await request<{ success: boolean; orders: FeedOrder[] }>(
        `/orders/${orderNumber}`
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

// Feed slice
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {
    // Clear feed data
    clearFeed: (state) => {
      state.orders = [];
      state.total = 0;
      state.totalToday = 0;
      state.error = null;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // WebSocket connection states
    builder
      .addCase(wsConnectionStart, (state) => {
        state.loading = true;
        state.error = null;
        state.wsConnected = false;
      })
      .addCase(wsConnectionSuccess, (state) => {
        state.loading = false;
        state.wsConnected = true;
        state.error = null;
      })
      .addCase(wsConnectionError, (state, action) => {
        state.loading = false;
        state.wsConnected = false;
        state.error = action.payload;
      })
      .addCase(wsConnectionClosed, (state) => {
        state.wsConnected = false;
        state.loading = false;
      })
      .addCase(wsGetMessage, (state, action) => {
        const data = action.payload as FeedData;
        if (data.success) {
          state.orders = data.orders;
          state.total = data.total;
          state.totalToday = data.totalToday;
          state.error = null;
        }
      });

    // Get order by number
    builder
      .addCase(getOrderByNumber.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.loading = false;
        // Add order to the list if it's not already there
        const existingOrderIndex = state.orders.findIndex(
          order => order.number === action.payload.number
        );
        
        if (existingOrderIndex === -1) {
          state.orders.unshift(action.payload);
        } else {
          state.orders[existingOrderIndex] = action.payload;
        }
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch order';
      });
  },
});

// Action creators
export const { clearFeed, clearError } = feedSlice.actions;

// Selectors
export const selectFeedOrders = (state: RootState) => state.feed.orders;
export const selectFeedTotal = (state: RootState) => state.feed.total;
export const selectFeedTotalToday = (state: RootState) => state.feed.totalToday;
export const selectFeedWsConnected = (state: RootState) => state.feed.wsConnected;
export const selectFeedLoading = (state: RootState) => state.feed.loading;
export const selectFeedError = (state: RootState) => state.feed.error;

// Derived selectors
export const selectFeedOrdersByStatus = (state: RootState) => {
  const orders = state.feed.orders;
  
  return {
    done: orders.filter((order: FeedOrder) => order.status === 'done'),
    pending: orders.filter((order: FeedOrder) => order.status === 'pending' || order.status === 'created'),
  };
};

export const selectFeedOrderByNumber = (orderNumber: number) => (state: RootState) => {
  return state.feed.orders.find((order: FeedOrder) => order.number === orderNumber);
};

// Helper action creators for WebSocket
export const connectToFeed = () => ({
  type: WS_CONNECTION_START,
  payload: { url: WS_ORDERS_ALL_URL }
});

export const disconnectFromFeed = () => ({
  type: WS_CONNECTION_CLOSE
});

export const feedReducer = feedSlice.reducer; 