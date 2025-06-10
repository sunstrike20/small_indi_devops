import React, { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './order-info-page.module.scss';
import { OrderIngredientItem } from '../components/order-ingredient-item/order-ingredient-item';
import { useAppDispatch, useAppSelector } from '../utils/store-types';
import { 
  selectFeedOrderByNumber,
  getOrderByNumber as getFeedOrderByNumber 
} from '../services/feed/feedSlice';
import { 
  selectOrderHistoryOrderByNumber,
  getUserOrderByNumber 
} from '../services/order-history/orderHistorySlice';
import { selectIngredients } from '../services/ingredients/ingredientsSlice';
import { selectIsAuthenticated } from '../services/auth/authSlice';
import { Preloader } from '../components/preloader/preloader';

interface IngredientDetails {
  _id: string;
  name: string;
  image: string;
  price: number;
  count: number;
}

// Helper function to process ingredients with counts
const processIngredients = (ingredientIds: string[], allIngredients: any[]) => {
  const ingredientCounts: { [key: string]: number } = {};
  
  // Count occurrences of each ingredient
  ingredientIds.forEach(id => {
    ingredientCounts[id] = (ingredientCounts[id] || 0) + 1;
  });
  
  // Create ingredient details with counts
  return Object.entries(ingredientCounts).map(([id, count]) => {
    const ingredient = allIngredients.find((item: any) => item._id === id);
    return ingredient ? {
      _id: ingredient._id,
      name: ingredient.name,
      image: ingredient.image,
      price: ingredient.price,
      count: count
    } : {
      _id: id,
      name: 'Неизвестный ингредиент',
      image: '',
      price: 0,
      count: count
    };
  });
};

// Helper function to calculate total price
const calculateTotalPrice = (ingredientIds: string[], allIngredients: any[]) => {
  return ingredientIds.reduce((total, ingredientId) => {
    const ingredient = allIngredients.find((item: any) => item._id === ingredientId);
    return total + (ingredient ? ingredient.price : 0);
  }, 0);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Создаем сегодня и вчера в московском времени
  const moscowDate = new Date(date.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let dayText = '';
  if (moscowDate.toDateString() === today.toDateString()) {
    dayText = 'Сегодня';
  } else if (moscowDate.toDateString() === yesterday.toDateString()) {
    dayText = 'Вчера';
  } else {
    dayText = moscowDate.toLocaleDateString('ru-RU');
  }
  
  const timeText = date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Moscow'
  });
  
  return `${dayText}, ${timeText}`;
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'done':
      return 'Выполнен';
    case 'pending':
      return 'Готовится';
    case 'created':
      return 'Создан';
    default:
      return 'Неизвестен';
  }
};

export const OrderInfoPage: React.FC = () => {
  const { number } = useParams<{ number: string }>();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Get order data from appropriate slice based on current path
  const isProfileOrder = location.pathname.includes('/profile/orders');
  const orderNumber = number ? parseInt(number) : 0;
  
  const feedOrder = useAppSelector(selectFeedOrderByNumber(orderNumber));
  const profileOrder = useAppSelector(selectOrderHistoryOrderByNumber(orderNumber));
  const allIngredients = useAppSelector(selectIngredients);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const order = isProfileOrder ? profileOrder : feedOrder;
  
  // Fetch order if not found in cache
  useEffect(() => {
    if (!order && orderNumber) {
      if (isProfileOrder && isAuthenticated) {
        dispatch(getUserOrderByNumber(orderNumber));
      } else if (!isProfileOrder) {
        dispatch(getFeedOrderByNumber(orderNumber));
      }
    }
  }, [dispatch, order, orderNumber, isProfileOrder, isAuthenticated]);
  
  if (!order) {
    return <Preloader message="Загрузка заказа..." />;
  }
  
  const processedIngredients = processIngredients(order.ingredients, allIngredients);
  const totalPrice = calculateTotalPrice(order.ingredients, allIngredients);

  return (
    <div className={styles.container}>
      <div className={styles.modal}>
        {/* Order ID - removed as it's already in modal header */}

        {/* Order Info */}
        <div className={styles.info}>
          <div className={styles.burgerName}>
            {order.name || `Заказ #${order.number}`}
          </div>
          <div className={`${styles.status} ${styles[order.status]}`}>
            {getStatusText(order.status)}
          </div>
        </div>

        {/* Ingredients */}
        <div className={styles.ingredients}>
          <div className={styles.compositionTitle}>
            Состав:
          </div>
          
          <div className={styles.scrollArea}>
            <div className={styles.ingredientsList}>
              {processedIngredients.map((ingredient: IngredientDetails) => (
                <OrderIngredientItem
                  key={ingredient._id}
                  ingredient={ingredient}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Time and Price */}
        <div className={styles.timePrice}>
          <div className={styles.timestamp}>
            {formatDate(order.createdAt)}
          </div>
          <div className={styles.totalPrice}>
            {totalPrice}
          </div>
          <CurrencyIcon type="primary" />
        </div>
      </div>
    </div>
  );
}; 