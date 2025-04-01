import { combineReducers } from 'redux';
import { ingredientsReducer } from '../ingredients/ingredientsSlice';
import { constructorReducer } from '../constructor/constructorSlice';
import { ingredientDetailsReducer } from '../ingredient-details/ingredientDetailsSlice';
import { orderReducer } from '../order/orderSlice';


export const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  constructor: constructorReducer,
  ingredientDetails: ingredientDetailsReducer,
  order: orderReducer
});

const initialState = rootReducer(undefined, { type: '@@INIT' });

Object.entries(initialState).forEach(([key, value]) => {
  if (typeof value === 'function') {
    console.error(`❌ State for "${key}" is a function instead of an object!`);
  } else {
    console.log(`✅ State for "${key}" is initialized correctly:`, typeof value);
  }
});

console.log('🏁 Initial state structure:', Object.keys(initialState));
