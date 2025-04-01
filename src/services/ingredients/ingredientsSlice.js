import { createSlice, createSelector } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

export const ingredientsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    getIngredientsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getIngredientsSuccess: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    },
    getIngredientsError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    }
  },
});

export const { 
  getIngredientsRequest, 
  getIngredientsSuccess, 
  getIngredientsError 
} = ingredientsSlice.actions;

export const ingredientsReducer = ingredientsSlice.reducer;


const getItems = state => state.ingredients?.items || [];
const getLoading = state => state.ingredients?.loading || false;
const getError = state => state.ingredients?.error || null;


export const selectIngredients = createSelector(
  [getItems],
  items => [...items]
);

export const selectIngredientsLoading = createSelector(
  [getLoading],
  loading => Boolean(loading)
);

export const selectIngredientsError = createSelector(
  [getError],
  error => error
);


export const fetchIngredients = () => {
  return async (dispatch) => {
    dispatch(getIngredientsRequest());
    try {
      const response = await fetch('https://norma.nomoreparties.space/api/ingredients');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        dispatch(getIngredientsSuccess(data.data));
      } else {
        throw new Error('Ошибка получения данных об ингредиентах');
      }
    } catch (error) {
      dispatch(getIngredientsError(error.message));
    }
  };
};
