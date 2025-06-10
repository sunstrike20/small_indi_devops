import { Middleware } from '@reduxjs/toolkit';
import { RootState } from '../../utils/types';

// WebSocket action types
export const WS_CONNECTION_START = 'WS_CONNECTION_START';
export const WS_CONNECTION_SUCCESS = 'WS_CONNECTION_SUCCESS';
export const WS_CONNECTION_ERROR = 'WS_CONNECTION_ERROR';
export const WS_CONNECTION_CLOSED = 'WS_CONNECTION_CLOSED';
export const WS_GET_MESSAGE = 'WS_GET_MESSAGE';
export const WS_SEND_MESSAGE = 'WS_SEND_MESSAGE';
export const WS_CONNECTION_CLOSE = 'WS_CONNECTION_CLOSE';

// WebSocket action interfaces
export interface WSConnectionStartAction {
  type: typeof WS_CONNECTION_START;
  payload: {
    url: string;
    token?: string;
  };
}

export interface WSConnectionSuccessAction {
  type: typeof WS_CONNECTION_SUCCESS;
}

export interface WSConnectionErrorAction {
  type: typeof WS_CONNECTION_ERROR;
  payload: string;
}

export interface WSConnectionClosedAction {
  type: typeof WS_CONNECTION_CLOSED;
}

export interface WSGetMessageAction {
  type: typeof WS_GET_MESSAGE;
  payload: any;
}

export interface WSSendMessageAction {
  type: typeof WS_SEND_MESSAGE;
  payload: any;
}

export interface WSConnectionCloseAction {
  type: typeof WS_CONNECTION_CLOSE;
}

export type WSAction = 
  | WSConnectionStartAction
  | WSConnectionSuccessAction 
  | WSConnectionErrorAction
  | WSConnectionClosedAction
  | WSGetMessageAction
  | WSSendMessageAction
  | WSConnectionCloseAction;

// Action creators
export const wsConnectionStart = (url: string, token?: string): WSConnectionStartAction => ({
  type: WS_CONNECTION_START,
  payload: { url, token }
});

export const wsConnectionSuccess = (): WSConnectionSuccessAction => ({
  type: WS_CONNECTION_SUCCESS
});

export const wsConnectionError = (error: string): WSConnectionErrorAction => ({
  type: WS_CONNECTION_ERROR,
  payload: error
});

export const wsConnectionClosed = (): WSConnectionClosedAction => ({
  type: WS_CONNECTION_CLOSED
});

export const wsGetMessage = (message: any): WSGetMessageAction => ({
  type: WS_GET_MESSAGE,
  payload: message
});

export const wsSendMessage = (message: any): WSSendMessageAction => ({
  type: WS_SEND_MESSAGE,
  payload: message
});

export const wsConnectionClose = (): WSConnectionCloseAction => ({
  type: WS_CONNECTION_CLOSE
});

// WebSocket URLs
export const WS_BASE_URL = 'wss://norma.nomoreparties.space';
export const WS_ORDERS_ALL_URL = `${WS_BASE_URL}/orders/all`;
export const WS_ORDERS_USER_URL = `${WS_BASE_URL}/orders`;

// WebSocket middleware
export const socketMiddleware = (): Middleware<{}, RootState> => {
  return (store) => {
    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;
    let shouldReconnect = true;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    const reconnectDelay = 3000;

    const cleanup = () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      shouldReconnect = false;
      reconnectAttempts = 0;
    };

    const connect = (url: string, token?: string) => {
      if (socket?.readyState === WebSocket.OPEN) {
        return;
      }

      const wsUrl = token ? `${url}?token=${token}` : url;
      
      try {
        socket = new WebSocket(wsUrl);
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        store.dispatch(wsConnectionError(error instanceof Error ? error.message : 'Connection failed') as any);
        return;
      }

      socket.onopen = () => {
        console.log('[WebSocket] Connected to:', wsUrl);
        reconnectAttempts = 0;
        store.dispatch(wsConnectionSuccess() as any);
      };

      socket.onerror = (event) => {
        console.error('[WebSocket] Error:', event);
        store.dispatch(wsConnectionError('WebSocket connection error') as any);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          console.log('[WebSocket] Message received:', {
            success: data.success,
            ordersCount: data.orders?.length || 0,
            total: data.total,
            totalToday: data.totalToday,
            message: data.message,
            url: wsUrl
          });
          
          // Handle token error response
          if (!data.success && data.message === 'Invalid or missing token') {
            console.error('[WebSocket] Invalid token, need to refresh');
            store.dispatch(wsConnectionError('Invalid or missing token') as any);
            cleanup();
            return;
          }
          
          store.dispatch(wsGetMessage(data) as any);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
          store.dispatch(wsConnectionError('Failed to parse message') as any);
        }
      };

      socket.onclose = (event) => {
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
        socket = null;
        store.dispatch(wsConnectionClosed() as any);

        // Auto-reconnect if not intentionally closed
        if (shouldReconnect && event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`[WebSocket] Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})...`);
          
          reconnectTimer = setTimeout(() => {
            connect(url, token);
          }, reconnectDelay);
        } else if (reconnectAttempts >= maxReconnectAttempts) {
          console.error('[WebSocket] Max reconnection attempts reached');
          store.dispatch(wsConnectionError('Max reconnection attempts reached') as any);
          cleanup();
        }
      };
    };

    const disconnect = () => {
      cleanup();
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'Manual disconnect');
      }
      socket = null;
    };

    return (next) => (action: any) => {
      const result = next(action);

      switch (action.type) {
        case WS_CONNECTION_START:
          shouldReconnect = true;
          reconnectAttempts = 0;
          connect(action.payload.url, action.payload.token);
          break;

        case WS_CONNECTION_CLOSE:
          disconnect();
          break;

        case WS_SEND_MESSAGE:
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(action.payload));
          } else {
            console.error('[WebSocket] Cannot send message - not connected');
          }
          break;

        default:
          break;
      }

      return result;
    };
  };
}; 