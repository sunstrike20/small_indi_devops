import { createSlice, createSelector } from '@reduxjs/toolkit';

let uuidv4;
try {
  const { v4 } = require('uuid');
  uuidv4 = v4;
} catch (error) {
  console.warn('uuid library not found, using fallback id generator');
  uuidv4 = () => Math.random().toString(36).substr(2, 9);
}

export const generateUuid = uuidv4;

const initialState = {
  bun: null,
  ingredients: []
};

function createSafeConstructorReducer() {
  const slice = createSlice({
    name: 'constructor',
    initialState,
    reducers: {
      setBun: (state, action) => {
        state.bun = action.payload;
      },
      
      addIngredient: (state, action) => {
        if (!Array.isArray(state.ingredients)) {
          state.ingredients = [];
        }
        state.ingredients.push(action.payload);
      },
      
      removeIngredient: (state, action) => {
        if (Array.isArray(state.ingredients)) {
          state.ingredients = state.ingredients.filter(item => 
            item.uuid !== action.payload
          );
        }
      },
      
      moveIngredient: (state, action) => {
        if (!Array.isArray(state.ingredients)) return;
        
        const { dragIndex, hoverIndex } = action.payload;
        const draggedItem = state.ingredients[dragIndex];
        
        if (draggedItem) {
          const newIngredients = [...state.ingredients];
          newIngredients.splice(dragIndex, 1);
          newIngredients.splice(hoverIndex, 0, draggedItem);
          state.ingredients = newIngredients;
        }
      },
      
      clear: (state) => {
        state.bun = null;
        state.ingredients = [];
      }
    }
  });

  return (state, action) => {
    if (state === undefined) {
      return initialState;
    }
    
    if (typeof state === 'function') {
      return { ...initialState };
    }
    
    if (!state.ingredients) {
      return {
        ...initialState,
        ...state,
      };
    }

    return slice.reducer(state, action);
  };
}

const constructorSlice = createSlice({
  name: 'constructor',
  initialState,
  reducers: {
    setBun: (state, action) => {
      state.bun = action.payload;
    },
    
    addIngredient: (state, action) => {
      if (!Array.isArray(state.ingredients)) {
        state.ingredients = [];
      }
      state.ingredients.push(action.payload);
    },
    
    removeIngredient: (state, action) => {
      if (Array.isArray(state.ingredients)) {
        state.ingredients = state.ingredients.filter(item => 
          item.uuid !== action.payload
        );
      }
    },
    
    moveIngredient: (state, action) => {
      if (!Array.isArray(state.ingredients)) return;
      
      const { dragIndex, hoverIndex } = action.payload;
      const draggedItem = state.ingredients[dragIndex];
      
      if (draggedItem) {
        const newIngredients = [...state.ingredients];
        newIngredients.splice(dragIndex, 1);
        newIngredients.splice(hoverIndex, 0, draggedItem);
        state.ingredients = newIngredients;
      }
    },
    
    clear: (state) => {
      state.bun = null;
      state.ingredients = [];
    }
  }
});

export const { 
  setBun, 
  addIngredient, 
  removeIngredient, 
  moveIngredient
} = constructorSlice.actions;

export const constructorReducer = createSafeConstructorReducer();

const getBun = state => {
  if (!state || !state.constructor || typeof state.constructor === 'function') {
    return null;
  }
  return state.constructor.bun;
};

const getIngredientsList = state => {
  if (!state || !state.constructor || typeof state.constructor === 'function') {
    return [];
  }
  return Array.isArray(state.constructor.ingredients) ? state.constructor.ingredients : [];
};

export const selectBun = createSelector(
  [getBun],
  bun => bun ? { ...bun } : null
);

export const selectIngredients = createSelector(
  [getIngredientsList],
  ingredients => ingredients.slice()
);

export const selectTotalPrice = createSelector(
  [getBun, getIngredientsList],
  (bun, ingredients) => {
    const bunPrice = bun ? bun.price * 2 : 0;
    const ingredientsPrice = Array.isArray(ingredients) 
      ? ingredients.reduce((sum, item) => sum + (item?.price || 0), 0) 
      : 0;
    
    return bunPrice + ingredientsPrice;
  }
);

// Создаем улучшенную версию clearConstructor, которая проверяет
// авторизацию пользователя перед очисткой конструктора
export const clearConstructor = () => {
  return (dispatch, getState) => {
    const { auth } = getState();
    
    // Очищаем конструктор только если пользователь авторизован
    // Это позволит сохранить состояние конструктора при перенаправлении на страницу логина
    if (auth.isAuthenticated) {
      dispatch(constructorSlice.actions.clear());
    }
  };
};
