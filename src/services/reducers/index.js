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
