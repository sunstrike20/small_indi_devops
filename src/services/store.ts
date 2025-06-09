import { configureStore, Middleware, Action, AnyAction } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';
import { RootState } from '../utils/types';

const stateLogger: Middleware<{}, RootState> = store => next => action => {
  const beforeState = store.getState();

  try {
    const result = next(action);
    return result;
  } catch (error: any) {
    console.error('❌ Error in action execution:', error);
    throw error;
  }
};

const crashReporter: Middleware = store => next => action => {
  try {
    return next(action);
  } catch (err: any) {
    console.error('💥 REDUCER ERROR:', err);
    return next({ 
      type: 'ERROR_HANDLED', 
      error: err.message 
    } as AnyAction);
  }
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(crashReporter, stateLogger)
}); 