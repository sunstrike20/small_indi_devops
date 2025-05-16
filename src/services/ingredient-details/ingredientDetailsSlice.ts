import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Ingredient, IngredientDetailsState, RootState } from '@utils/types';

const initialState: IngredientDetailsState = {
  currentIngredient: null
};

export const ingredientDetailsSlice = createSlice({
  name: 'ingredientDetails',
  initialState,
  reducers: {
    setCurrentIngredient: (state, action: PayloadAction<Ingredient>) => {
      state.currentIngredient = action.payload;
    },
    clearCurrentIngredient: (state) => {
      state.currentIngredient = null;
    }
  }
});

export const { setCurrentIngredient, clearCurrentIngredient } = ingredientDetailsSlice.actions;
export const ingredientDetailsReducer = ingredientDetailsSlice.reducer;


export const selectCurrentIngredient = (state: RootState): Ingredient | null => 
  state.ingredientDetails ? state.ingredientDetails.currentIngredient : null; 