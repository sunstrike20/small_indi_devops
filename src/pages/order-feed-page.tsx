import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OrderCard } from '../components/order-card/order-card';
import { OrderStats } from '../components/order-stats/order-stats';
import { useAppDispatch, useAppSelector } from '../utils/store-types';
import {
  connectToFeed,
  disconnectFromFeed,
  selectFeedOrders,
  selectFeedTotal,
  selectFeedTotalToday,
  selectFeedOrdersByStatus,
  selectFeedLoading,
  selectFeedError,
  FeedOrder
} from '../services/feed/feedSlice';
import { selectIngredients } from '../services/ingredients/ingredientsSlice';
import { Preloader } from '../components/preloader/preloader';
import styles from './order-feed-page.module.scss';

// Helper function to calculate order price
const calculateOrderPrice = (ingredients: string[], allIngredients: any[]) => {
  return ingredients.reduce((total, ingredientId) => {
    const ingredient = allIngredients.find((item: any) => item._id === ingredientId);
    return total + (ingredient ? ingredient.price : 0);
  }, 0);
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  
  // Вычисляем разницу в московском времени
  const moscowDate = new Date(date.toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
  const moscowNow = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Moscow"}));
  const diffTime = moscowNow.getTime() - moscowDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const timeString = date.toLocaleTimeString('ru-RU', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Moscow'
  });
  
  if (diffDays === 0) {
    return `Сегодня, ${timeString}`;
  } else if (diffDays === 1) {
    return `Вчера, ${timeString}`;
  } else if (diffDays <= 7) {
    return `${diffDays} дня назад, ${timeString}`;
  } else {
    return moscowDate.toLocaleDateString('ru-RU');
  }
};

// Helper function to get ingredient preview data
const getIngredientPreviews = (ingredients: string[], allIngredients: any[]) => {
  return ingredients.map(ingredientId => {
    const ingredient = allIngredients.find((item: any) => item._id === ingredientId);
    return ingredient ? {
      _id: ingredient._id,
      name: ingredient.name,
      image: ingredient.image_mobile,
      price: ingredient.price
    } : {
      _id: ingredientId,
      name: 'Неизвестный ингредиент',
      image: '',
      price: 0
    };
  });
};

export const OrderFeedPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Selectors
  const orders = useAppSelector(selectFeedOrders);
  const total = useAppSelector(selectFeedTotal);
  const totalToday = useAppSelector(selectFeedTotalToday);
  const ordersByStatus = useAppSelector(selectFeedOrdersByStatus);
  const loading = useAppSelector(selectFeedLoading);
  const error = useAppSelector(selectFeedError);
  const allIngredients = useAppSelector(selectIngredients);

  // Connect to WebSocket on mount
  useEffect(() => {
    dispatch(connectToFeed());
    
    return () => {
      dispatch(disconnectFromFeed());
    };
  }, [dispatch]);

  const handleOrderClick = (orderNumber: number) => {
    // Navigate to order details page with background location for modal
    navigate(`/feed/${orderNumber}`, {
      state: { backgroundLocation: location }
    });
  };

  if (loading) {
    return <Preloader message="Подключение к ленте заказов..." />;
  }

  if (error) {
    return (
      <Preloader 
        loading={false} 
        message={`Ошибка подключения: ${error}`} 
        error={true} 
      />
    );
  }

  return (
    <div className={styles.orderFeed}>
      <div className={styles.container}>
        <h1 className={styles.title}>Лента заказов</h1>
        
        <div className={styles.content}>
          {/* Список заказов */}
          <div className={styles.orders}>
            <div className={styles.list}>
              {orders.map((order: FeedOrder) => (
                <OrderCard
                  key={order._id}
                  orderId={order.number.toString()}
                  timestamp={formatTimestamp(order.createdAt)}
                  name={order.name || `Заказ #${order.number}`}
                  ingredients={getIngredientPreviews(order.ingredients, allIngredients)}
                  status={order.status}
                  showStatus={false} // В публичной ленте статус не показываем
                  totalPrice={calculateOrderPrice(order.ingredients, allIngredients)}
                  onClick={() => handleOrderClick(order.number)}
                />
              ))}
            </div>
          </div>

          {/* Статистика */}
          <div className={styles.stats}>
            <OrderStats
              doneOrders={ordersByStatus.done.slice(0, 10).map((order: FeedOrder) => order.number.toString())}
              pendingOrders={ordersByStatus.pending.slice(0, 10).map((order: FeedOrder) => order.number.toString())}
              totalCompleted={total}
              todayCompleted={totalToday}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 