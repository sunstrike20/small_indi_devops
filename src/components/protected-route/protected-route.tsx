import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, Location } from 'react-router-dom';
import {
	selectIsAuthenticated,
	selectAuthLoading,
} from '../../services/auth/authSlice';
import { Preloader } from '../preloader/preloader';
import { ProtectedRouteProps } from '@utils/types';
import { useAppSelector } from '@utils/store-types';

/**
 * ProtectedRoute component controls access to routes based on authentication status
 * and specific conditions for password reset flow.
 */
const ProtectedRouteComponent: React.FC<ProtectedRouteProps> = ({
	element,
	anonymous = false,
	passwordReset = false,
}) => {
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isAuthLoading = useAppSelector(selectAuthLoading);
	const location = useLocation();

	interface AuthStateRef {
		isAuthenticated: boolean;
		isAuthLoading: boolean;
	}

	const lastRenderedPath = useRef<string>(location.pathname);
	const lastAuthState = useRef<AuthStateRef>({
		isAuthenticated,
		isAuthLoading,
	});
	// Счетчик для отслеживания количества рендеров
	const renderCount = useRef<number>(0);

	// Используем useEffect для логирования состояний
	useEffect(() => {
		const pathChanged = lastRenderedPath.current !== location.pathname;
		const authChanged =
			lastAuthState.current.isAuthenticated !== isAuthenticated ||
			lastAuthState.current.isAuthLoading !== isAuthLoading;

		if (pathChanged || authChanged) {
			lastRenderedPath.current = location.pathname;
			lastAuthState.current = { isAuthenticated, isAuthLoading };
		}
	}, [
		location.pathname,
		isAuthenticated,
		isAuthLoading,
		anonymous,
		passwordReset,
		location.state,
	]);

	// Дополнительный отладочный лог на случай бесконечного цикла рендеринга
	useEffect(() => {
		renderCount.current += 1;
	}, [location.pathname]);

	// Показываем индикатор загрузки при проверке авторизации
	if (isAuthLoading) {
		return <Preloader message='Проверка авторизации...' />;
	}

	// Случай 1: Защита reset-password от прямого доступа
	if (passwordReset) {
		const resetInitiated = localStorage.getItem('passwordResetEmailSent');

		if (!resetInitiated) {
			return (
				<Navigate to='/forgot-password' state={{ from: location }} replace />
			);
		}
	}

	// Случай 2: Авторизованный пользователь пытается зайти на страницу для неавторизованных
	if (anonymous && isAuthenticated) {
		// Для страницы forgot-password авторизованного пользователя всегда направлять на главную
		if (location.pathname === '/forgot-password') {
			return <Navigate to='/' replace />;
		}

		// Для остальных страниц берем сохраненный путь или главную
		const fromPath =
			(location.state as { from?: { pathname: string } })?.from?.pathname ||
			'/';
		return <Navigate to={fromPath} replace />;
	}

	// Случай 3: Неавторизованный пользователь пытается зайти на защищенную страницу
	if (!anonymous && !isAuthenticated) {
		return (
			<Navigate
				to='/login'
				state={{ from: { pathname: location.pathname } }}
				replace
			/>
		);
	}

	// Случай 4: Нормальный доступ (авторизованный к защищенной или неавторизованный к публичной)
	return element;
};

// Используем React.memo для оптимизации рендеринга
export const ProtectedRoute = React.memo(
	ProtectedRouteComponent,
	(prevProps: ProtectedRouteProps, nextProps: ProtectedRouteProps) => {
		return (
			prevProps.anonymous === nextProps.anonymous &&
			prevProps.passwordReset === nextProps.passwordReset &&
			prevProps.element === nextProps.element
		);
	}
);
