import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectIsAuthenticated, selectAuthLoading } from '../../services/auth/authSlice';
import { Preloader } from '../preloader/preloader';

/**
 * ProtectedRoute component controls access to routes based on authentication status
 * and specific conditions for password reset flow.
 *
 * @param {Object} props
 * @param {JSX.Element} props.element - The element to render if access is granted
 * @param {boolean} props.anonymous - If true, route is only for non-authenticated users
 * @param {boolean} props.passwordReset - If true, checks for password reset flow
 * @returns {JSX.Element}
 */
const ProtectedRouteComponent = ({ element, anonymous = false, passwordReset = false }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAuthLoading = useSelector(selectAuthLoading);
  const location = useLocation();
  const lastRenderedPath = useRef(location.pathname);
  const lastAuthState = useRef({isAuthenticated, isAuthLoading});
  
  // Используем useEffect для логирования состояний
  useEffect(() => {
    const pathChanged = lastRenderedPath.current !== location.pathname;
    const authChanged = lastAuthState.current.isAuthenticated !== isAuthenticated || 
                         lastAuthState.current.isAuthLoading !== isAuthLoading;
    
    if (pathChanged || authChanged) {
      console.log('[ProtectedRoute] State changed:', { 
        path: location.pathname,
        isAuthenticated, 
        isAuthLoading, 
        anonymous,
        passwordReset,
        location: location.state
      });
      
      lastRenderedPath.current = location.pathname;
      lastAuthState.current = {isAuthenticated, isAuthLoading};
    }
  }, [location.pathname, isAuthenticated, isAuthLoading, anonymous, passwordReset]);

  // Показываем индикатор загрузки при проверке авторизации
  if (isAuthLoading) {
    console.log('[ProtectedRoute] Loading auth state');
    return <Preloader message="Проверка авторизации..." />;
  }

  // Случай 1: Защита reset-password от прямого доступа
  if (passwordReset) {
    const resetInitiated = localStorage.getItem('passwordResetEmailSent');
    console.log('[ProtectedRoute] Password reset check:', { resetInitiated });
    
    if (!resetInitiated) {
      console.log('[ProtectedRoute] No reset initiated, redirecting');
      return <Navigate to="/forgot-password" state={{ from: location }} replace />;
    }
  }

  // Случай 2: Авторизованный пользователь пытается зайти на страницу для неавторизованных
  if (anonymous && isAuthenticated) {
    console.log('[ProtectedRoute] Authenticated user at anonymous route');
    
    // Для страницы forgot-password авторизованного пользователя всегда направлять на главную
    if (location.pathname === '/forgot-password') {
      console.log('[ProtectedRoute] Redirecting from forgot-password to home');
      return <Navigate to="/" replace />;
    }
    
    // Для остальных страниц берем сохраненный путь или главную
    const fromPath = location.state?.from?.pathname || '/';
    console.log('[ProtectedRoute] Redirecting to:', fromPath);
    return <Navigate to={fromPath} replace />;
  }

  // Случай 3: Неавторизованный пользователь пытается зайти на защищенную страницу
  if (!anonymous && !isAuthenticated) {
    console.log('[ProtectedRoute] Unauthenticated user at protected route');
    return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  }

  // Случай 4: Нормальный доступ (авторизованный к защищенной или неавторизованный к публичной)
  console.log('[ProtectedRoute] Access granted');
  return element;
};

// Используем React.memo для оптимизации рендеринга
export const ProtectedRoute = React.memo(ProtectedRouteComponent, 
  (prevProps, nextProps) => {
    return prevProps.anonymous === nextProps.anonymous && 
           prevProps.passwordReset === nextProps.passwordReset &&
           prevProps.element === nextProps.element;
  }
); 