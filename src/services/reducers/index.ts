import { combineReducers } from 'redux';
import { ingredientsReducer } from '../ingredients/ingredientsSlice';
import { constructorReducer } from '../constructor/constructorSlice';
import { ingredientDetailsReducer } from '../ingredient-details/ingredientDetailsSlice';
import { orderReducer } from '../order/orderSlice';
import { authReducer } from '../auth/authSlice';
import { feedReducer } from '../feed/feedSlice';
import { orderHistoryReducer } from '../order-history/orderHistorySlice';

export const rootReducer = combineReducers({
	ingredients: ingredientsReducer,
	constructor: constructorReducer,
	ingredientDetails: ingredientDetailsReducer,
	order: orderReducer,
	auth: authReducer,
	feed: feedReducer,
	orderHistory: orderHistoryReducer,
});
