import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentIngredient: null
};

export const ingredientDetailsSlice = createSlice({
  name: 'ingredientDetails',
  initialState,
  reducers: {
    setCurrentIngredient: (state, action) => {
      state.currentIngredient = action.payload;
    },
    clearCurrentIngredient: (state) => {
      state.currentIngredient = null;
    }
  }
});

export const { setCurrentIngredient, clearCurrentIngredient } = ingredientDetailsSlice.actions;
export const ingredientDetailsReducer = ingredientDetailsSlice.reducer;


export const selectCurrentIngredient = (state) => 
  state.ingredientDetails ? state.ingredientDetails.currentIngredient : null;
