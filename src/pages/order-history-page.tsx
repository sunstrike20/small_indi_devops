import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './order-history-page.module.scss';
import { IngredientPreview } from '../components/ingredient-preview/ingredient-preview';
import { ProfileNavigation } from '../components/profile-navigation';
import { ProfileCaption } from '../components/profile-caption';
import { useAppDispatch, useAppSelector } from '../utils/store-types';
import {
  connectToUserOrders,
  disconnectFromUserOrders,
  selectOrderHistoryOrders,
  selectOrderHistoryLoading,
  selectOrderHistoryError,
  selectOrderHistoryWsConnected,
  selectOrderHistoryDataReceived
} from '../services/order-history/orderHistorySlice';
import { selectIngredients } from '../services/ingredients/ingredientsSlice';
import { selectAccessToken, selectIsAuthenticated } from '../services/auth/authSlice';
import { FeedOrder } from '../services/feed/feedSlice';
import { Preloader } from '../components/preloader/preloader';

// Helper function to calculate order price
const calculateOrderPrice = (ingredients: string[], allIngredients: any[]) => {
  return ingredients.reduce((total, ingredientId) => {
    const ingredient = allIngredients.find((item: any) => item._id === ingredientId);
    return total + (ingredient ? ingredient.price : 0);
  }, 0);
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

export const OrderHistoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Selectors
  const orders = useAppSelector(selectOrderHistoryOrders);
  const loading = useAppSelector(selectOrderHistoryLoading);
  const error = useAppSelector(selectOrderHistoryError);
  const wsConnected = useAppSelector(selectOrderHistoryWsConnected);
  const dataReceived = useAppSelector(selectOrderHistoryDataReceived);
  const allIngredients = useAppSelector(selectIngredients);
  const accessToken = useAppSelector(selectAccessToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  // Debug Redux state directly
  const entireOrderHistoryState = useAppSelector((state: any) => state.orderHistory);
  console.log('[OrderHistoryPage] Raw Redux state:', entireOrderHistoryState);

  // Debug logging
  console.log('[OrderHistoryPage] Debug state:', {
    ordersCount: orders.length,
    loading,
    error,
    wsConnected,
    dataReceived,
    isAuthenticated,
    hasAccessToken: !!accessToken,
    hasIngredients: allIngredients.length > 0,
    firstOrderIngredients: orders[0]?.ingredients?.slice(0, 3) || [],
    firstOrderNumber: orders[0]?.number || 'none',
    firstOrderName: orders[0]?.name || 'none',
    orders: orders.slice(0, 1).map(order => ({
      _id: order._id,
      number: order.number,
      name: order.name,
      status: order.status,
      ingredients: order.ingredients,
      createdAt: order.createdAt
    })) // Show detailed first order for debugging
  });

  // Connect to WebSocket on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      dispatch(connectToUserOrders(accessToken));
    }
    
    return () => {
      dispatch(disconnectFromUserOrders());
    };
  }, [dispatch, isAuthenticated, accessToken]);



  const handleOrderClick = (orderNumber: number) => {
    // Navigate to order details page with background location for modal
    navigate(`/profile/orders/${orderNumber}`, {
      state: { backgroundLocation: location }
    });
  };

  // Show preloader if loading or not connected yet
  if (loading || (isAuthenticated && !wsConnected && !error)) {
    return <Preloader message="Подключение к истории заказов..." />;
  }

  // Show error if connection failed
  if (error) {
    return (
      <Preloader 
        loading={false} 
        message={`Ошибка подключения: ${error}`} 
        error={true} 
      />
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Final render decision logging
  console.log(`[OrderHistoryPage] Final render: dataReceived=${dataReceived}, ordersLength=${orders.length}, will render=${dataReceived ? (orders.length === 0 ? 'empty state' : 'orders list') : 'preloader'}`);

  return (
    <div className={styles.container}>
      {/* Profile Navigation */}
      <ProfileNavigation />

      {/* Caption */}
      <ProfileCaption />

      {/* Orders List */}
      <div className={styles.orders}>
        {!dataReceived ? (
          <Preloader message="Загружаем ваши заказы..." />
        ) : orders.length === 0 ? (
          <div className={styles.emptyState}>
            <p className="text text_type_main-medium">У вас пока нет заказов</p>
          </div>
        ) : (
          // Сортируем заказы по дате создания - самые новые сверху
          [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order: FeedOrder, index: number) => {
            // Debug logging for each order rendering
            if (index < 3) { // Log first 3 orders
              console.log(`[OrderHistoryPage] Rendering order ${index}:`, {
                _id: order._id,
                number: order.number,
                name: order.name,
                status: order.status,
                ingredients: order.ingredients,
                createdAt: order.createdAt,
                ingredientPreviews: getIngredientPreviews(order.ingredients, allIngredients),
                calculatedPrice: calculateOrderPrice(order.ingredients, allIngredients)
              });
            }
            
            // Additional detailed logging for visual elements
            const ingredientPreviews = getIngredientPreviews(order.ingredients, allIngredients);
            const calculatedPrice = calculateOrderPrice(order.ingredients, allIngredients);
            
            if (index < 3) {
              console.log(`[OrderHistoryPage] Order ${index} VISUAL DATA:`, {
                orderNumber: order.number,
                ingredientPreviews: ingredientPreviews.map(ing => ({
                  id: ing._id,
                  name: ing.name,
                  image: ing.image,
                  price: ing.price
                })),
                calculatedPrice,
                totalIngredients: order.ingredients.length,
                rawIngredientIds: order.ingredients
              });
            }
            
            return (
              <div 
                key={order._id} 
                className={styles.orderCard}
                onClick={() => handleOrderClick(order.number)}
              >
                {/* Order ID and Timestamp */}
                <div className={styles.orderHeader}>
                  <div className={styles.orderId}>
                    #{order.number}
                  </div>
                  <div className={styles.timestamp}>
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                {/* Order Info */}
                <div className={styles.orderInfo}>
                  <div className={styles.burgerName}>
                    {order.name || `Заказ #${order.number}`}
                  </div>
                  <div className={`${styles.status} ${styles[order.status]}`}>
                    {getStatusText(order.status)}
                  </div>
                </div>

                {/* Ingredients and Price */}
                <div className={styles.componentsPrice}>
                  <div className={styles.ingredients}>
                    <IngredientPreview 
                      ingredients={ingredientPreviews}
                      maxVisible={6}
                    />
                  </div>
                  
                  <div className={styles.price}>
                    <div className={styles.priceValue}>
                      {calculatedPrice}
                    </div>
                    <CurrencyIcon type="primary" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}; 