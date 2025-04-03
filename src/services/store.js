import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from './reducers';

const stateLogger = store => next => action => {
  const beforeState = store.getState();

  try {
    const result = next(action);
    return result;
  } catch (error) {
    console.error('❌ Error in action execution:', error);
    throw error;
  }
};

const crashReporter = store => next => action => {
  try {
    return next(action);
  } catch (err) {
    console.error('💥 REDUCER ERROR:', err);
    return next({ type: 'ERROR_HANDLED', error: err.message });
  }
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(crashReporter, stateLogger)
});
