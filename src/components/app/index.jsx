import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, useLocation, useParams } from 'react-router-dom';
import { AppHeader } from '@components/app-header/app-header';
import { Modal } from '../modal/modal';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { OrderDetails } from '../order-details/order-details';
import { Preloader } from '../preloader/preloader';
import { ProtectedRoute } from '../protected-route/protected-route';
import styles from './app.module.scss';
import { fetchIngredients, selectIngredientsLoading, selectIngredientsError } from '@services/ingredients/ingredientsSlice';
import { selectCurrentIngredient, clearCurrentIngredient, setCurrentIngredient } from '@services/ingredient-details/ingredientDetailsSlice';
import { selectOrder, clearOrder } from '@services/order/orderSlice';
import { getRefreshToken, refreshToken, fetchUser, selectIsAuthenticated, removeRefreshToken } from '@services/auth/authSlice';
import React from 'react';

import {
  MainPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  ProfilePage,
  IngredientPage,
  NotFoundPage
} from '../../pages';

// Modal ingredient details component
const ModalIngredientDetails = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const selectedIngredient = useSelector(selectCurrentIngredient);
  const allIngredients = useSelector(state => state.ingredients.items);
  
  useEffect(() => {
    // If no ingredient is selected but we have an id, find the ingredient and set it
    if (!selectedIngredient && id && allIngredients.length > 0) {
      const ingredient = allIngredients.find(item => item._id === id);
      if (ingredient) {
        dispatch(setCurrentIngredient(ingredient));
      }
    }
  }, [selectedIngredient, id, allIngredients, dispatch]);
  
  const handleCloseModal = () => {
    dispatch(clearCurrentIngredient());
    window.history.back();
  };
  
  // If ingredient is still loading
  if (!selectedIngredient) {
    return (
      <Modal title="Детали ингредиента" onClose={handleCloseModal}>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p className="text text_type_main-default">Загрузка...</p>
        </div>
      </Modal>
    );
  }
  
  return (
    <Modal title="Детали ингредиента" onClose={handleCloseModal}>
      <IngredientDetails ingredient={selectedIngredient} />
    </Modal>
  );
};

const ModalSwitch = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectIngredientsLoading) || false;
  const error = useSelector(selectIngredientsError);
  const order = useSelector(selectOrder);
  
  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  const handleCloseModal = () => {
    if (order) {
      dispatch(clearOrder());
    }
  };

  const status = loading ? 'loading' : error ? 'error' : 'done';

  return (
    <>
      {order && (
        <Modal title="" onClose={handleCloseModal}>
          <OrderDetails order={order} />
        </Modal>
      )}

      {status === 'loading' && (
        <Preloader message="Загрузка ингредиентов..." />
      )}
      
      {status === 'error' && (
        <Preloader 
          loading={false} 
          message="Не удалось загрузить ингредиенты. Пожалуйста, попробуйте позже." 
          error={true}
        />
      )}
    </>
  );
};

const AppWithAuth = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const autoLoginAttempted = React.useRef(false);
  
  // Get the background location if it exists
  const backgroundLocation = location.state?.backgroundLocation;
  
  // Check for existing tokens and attempt to auto-login
  useEffect(() => {
    const attemptAutoLogin = async () => {
      // Предотвращаем повторные попытки авто-логина
      if (autoLoginAttempted.current || isAuthenticated) {
        return;
      }
      
      autoLoginAttempted.current = true;
      
      const refreshTokenValue = getRefreshToken();
      console.log('[App] Auto-login check:', {
        hasToken: !!refreshTokenValue,
        isAuthenticated
      });
      
      if (refreshTokenValue) {
        try {
          console.log('[App] Attempting auto-login with refresh token');
          // First refresh the access token
          const refreshResult = await dispatch(refreshToken()).unwrap();
          console.log('[App] Token refresh successful:', !!refreshResult.accessToken);
          
          // Then fetch the user data
          await dispatch(fetchUser()).unwrap();
          console.log('[App] Auto-login successful');
        } catch (error) {
          console.error('[App] Auto-login failed:', error);
          // В случае ошибки автологина очищаем устаревшие токены
          if (typeof error === 'string' && (error.includes('401') || error.includes('403'))) {
            console.log('[App] Clearing invalid refresh token');
            removeRefreshToken();
          }
        }
      }
    };
    
    attemptAutoLogin();
  }, [dispatch]); // Удалена зависимость от isAuthenticated
  
  return (
    <div className={styles.app}>
      <AppHeader />
      <ModalSwitch />
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<MainPage />} />
        
        {/* Anonymous routes - only for non-authenticated users */}
        <Route 
          path="/login" 
          element={<ProtectedRoute element={<LoginPage />} anonymous={true} />} 
        />
        <Route 
          path="/register" 
          element={<ProtectedRoute element={<RegisterPage />} anonymous={true} />} 
        />
        <Route 
          path="/forgot-password" 
          element={<ProtectedRoute element={<ForgotPasswordPage />} anonymous={true} />} 
        />
        <Route 
          path="/reset-password" 
          element={
            <ProtectedRoute 
              element={<ResetPasswordPage />} 
              anonymous={true} 
              passwordReset={true}
            />
          } 
        />
        
        {/* Protected routes - only for authenticated users */}
        <Route 
          path="/profile/*" 
          element={<ProtectedRoute element={<ProfilePage />} />} 
        />
        
        {/* Public routes */}
        <Route path="/ingredients/:id" element={<IngredientPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      
      {/* Modal routes */}
      {backgroundLocation && (
        <Routes>
          <Route 
            path="/ingredients/:id"
            element={<ModalIngredientDetails />}
          />
        </Routes>
      )}
    </div>
  );
};

export const App = () => {
  return (
    <Router>
      <AppWithAuth />
    </Router>
  );
};