// Базовые типы для ингредиентов

export type IngredientType = 'bun' | 'main' | 'sauce';

// Интерфейс для ингредиента
export interface Ingredient {
  _id: string;
  name: string;
  type: IngredientType;
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_mobile: string;
  image_large: string;
  __v: number;
}

// Интерфейс для ингредиента в конструкторе (с уникальным id)
export interface ConstructorIngredient extends Ingredient {
  uuid: string;
}

// Интерфейс для перемещения элементов в конструкторе
export interface DragItem {
  index: number;
  id: string;
  type: string;
}

// Интерфейс для пользователя
export interface User {
  email: string;
  name: string;
}

// Интерфейс для авторизации
export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Интерфейс для данных заказа
export interface Order {
  _id: string;
  number: number;
  name: string;
  status: 'created' | 'pending' | 'done';
  createdAt: string;
  updatedAt: string;
  ingredients: string[];
}

// Типы для состояний Redux

// Состояние ингредиентов
export interface IngredientsState {
  items: Ingredient[];
  loading: boolean;
  error: string | null;
}

// Состояние конструктора
export interface ConstructorState {
  bun: Ingredient | null;
  ingredients: ConstructorIngredient[];
}

// Состояние текущего ингредиента
export interface IngredientDetailsState {
  currentIngredient: Ingredient | null;
}

// Состояние заказа
export interface OrderState {
  order: Order | null;
  loading: boolean;
  error: string | null;
}

// Состояние авторизации
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  tokenRefreshAttempted: boolean;
}

// Общий тип состояния приложения
export interface RootState {
  ingredients: IngredientsState;
  constructor: ConstructorState;
  ingredientDetails: IngredientDetailsState;
  order: OrderState;
  auth: AuthState;
}

// Типы для компонентов

// Пропсы модального окна
export interface ModalProps {
  title?: string;
  children: React.ReactNode;
  onClose: () => void;
}

// Пропсы для наложения модального окна
export interface ModalOverlayProps {
  onClick: () => void;
}

// Пропсы для детальной информации об ингредиенте
export interface IngredientDetailsProps {
  ingredient: Ingredient;
}

// Пропсы для прелоадера
export interface PreloaderProps {
  size?: number;
  color?: string;
  loading?: boolean;
  message?: string;
  error?: boolean;
}

// Пропсы для перетаскиваемого элемента конструктора
export interface DraggableConstructorElementProps {
  item: ConstructorIngredient;
  index: number;
  handleDelete: (uuid: string) => void;
  moveIngredient: (dragIndex: number, hoverIndex: number) => void;
}

// Пропсы для перетаскиваемого ингредиента
export interface DraggableIngredientProps {
  ingredient: Ingredient;
  count: number;
  onClick: () => void;
}

// Пропсы для защищенного маршрута
export interface ProtectedRouteProps {
  element: React.ReactElement;
  anonymous?: boolean;
  passwordReset?: boolean;
} 