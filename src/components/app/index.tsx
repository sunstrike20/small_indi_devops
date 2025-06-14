import React, { useEffect, useRef } from 'react';
import {
	HashRouter as Router,
	Routes,
	Route,
	useLocation,
	useNavigate,
	useParams,
	Location,
} from 'react-router-dom';
import { AppHeader } from '@components/app-header/app-header';
import { Modal } from '../modal/modal';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { OrderDetails } from '../order-details/order-details';
import { Preloader } from '../preloader/preloader';
import { ProtectedRoute } from '../protected-route/protected-route';
import styles from './app.module.scss';
import {
	fetchIngredients,
	selectIngredientsLoading,
	selectIngredientsError,
} from '@services/ingredients/ingredientsSlice';
import {
	selectCurrentIngredient,
	clearCurrentIngredient,
	setCurrentIngredient,
} from '@services/ingredient-details/ingredientDetailsSlice';
import { selectOrder, clearOrder } from '@services/order/orderSlice';
import {
	getRefreshToken,
	refreshToken,
	fetchUser,
	selectIsAuthenticated,
	removeRefreshToken,
	setAutoLoginAttempted,
} from '@services/auth/authSlice';
import { Ingredient, RootState } from '@utils/types';
import { useAppDispatch, useAppSelector } from '@utils/store-types';

import {
	MainPage,
	LoginPage,
	RegisterPage,
	ForgotPasswordPage,
	ResetPasswordPage,
	ProfilePage,
	IngredientPage,
	NotFoundPage,
	OrderFeedPage,
	OrderInfoPage,
	OrderHistoryPage,
} from '../../pages';

interface LocationState {
	backgroundLocation?: Location;
}

// Modal ingredient details component
const ModalIngredientDetails: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const currentIngredient = useAppSelector(selectCurrentIngredient);
	const location = useLocation();
	const params = useParams<{ id: string }>();
	const id = params.id;

	// Get all ingredients
	const ingredients = useAppSelector(
		(state: RootState) => state.ingredients.items
	);

	// Find the ingredient that matches the ID in the URL
	const ingredient = ingredients.find((item: Ingredient) => item._id === id);

	useEffect(() => {
		// Set the current ingredient if found and not already set
		if (ingredient && (!currentIngredient || currentIngredient._id !== id)) {
			dispatch(setCurrentIngredient(ingredient));
		}
	}, [dispatch, ingredient, currentIngredient, id]);

	const handleClose = () => {
		// Go back to the previous location
		navigate(-1);

		// Clear the current ingredient details from the store
		dispatch(clearCurrentIngredient());
	};

	if (!ingredient) {
		return null;
	}

	return (
		<Modal title='Детали ингредиента' onClose={handleClose}>
			<IngredientDetails ingredient={ingredient} />
		</Modal>
	);
};

// Modal order details component for feed orders
const ModalFeedOrderDetails: React.FC = () => {
	const navigate = useNavigate();
	const { number } = useParams<{ number: string }>();
	const orderNumber = number ? parseInt(number) : 0;
	
	const handleClose = () => {
		// Go back to the previous location
		navigate(-1);
	};

	return (
		<Modal title={`#${orderNumber}`} onClose={handleClose}>
			<OrderInfoPage />
		</Modal>
	);
};

// Modal order details component for profile orders
const ModalProfileOrderDetails: React.FC = () => {
	const navigate = useNavigate();
	const { number } = useParams<{ number: string }>();
	const orderNumber = number ? parseInt(number) : 0;
	
	const handleClose = () => {
		// Go back to the previous location
		navigate(-1);
	};

	return (
		<Modal title={`#${orderNumber}`} onClose={handleClose}>
			<OrderInfoPage />
		</Modal>
	);
};

// Main component for switching between routes
const ModalSwitch: React.FC = () => {
	const dispatch = useAppDispatch();
	const ingredientsLoading = useAppSelector(selectIngredientsLoading);
	const ingredientsError = useAppSelector(selectIngredientsError);
	const order = useAppSelector(selectOrder);

	useEffect(() => {
		// Fetch ingredients data when the component mounts
		dispatch(fetchIngredients());
	}, [dispatch]);

	const handleCloseModal = () => {
		if (order) {
			dispatch(clearOrder());
		}
	};

	// Determine the status of the app
	let status: 'loading' | 'error' | 'ready' = 'ready';

	if (ingredientsLoading) {
		status = 'loading';
	} else if (ingredientsError) {
		status = 'error';
	}

	return (
		<>
			{order && (
				<Modal title='' onClose={handleCloseModal}>
					<OrderDetails order={order} />
				</Modal>
			)}

			{status === 'loading' && <Preloader message='Загрузка ингредиентов...' />}

			{status === 'error' && (
				<Preloader
					loading={false}
					message='Не удалось загрузить ингредиенты. Пожалуйста, попробуйте позже.'
					error={true}
				/>
			)}
		</>
	);
};

const AppWithAuth: React.FC = () => {
	const dispatch = useAppDispatch();
	const location = useLocation() as Location & { state: LocationState };
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	// Используем селектор для проверки состояния tokenRefreshAttempted из Redux
	const tokenRefreshAttempted = useAppSelector(
		(state: RootState) => state.auth.tokenRefreshAttempted
	);
	const autoLoginAttempted = useRef<boolean>(false);

	// Get the background location if it exists
	const backgroundLocation = location.state?.backgroundLocation;

	// Первая проверка при монтировании - устанавливает флаг для случая когда нет токена
	useEffect(() => {
		// Выполняется только один раз при монтировании
		console.log('[App] Initial auth check on component mount');

		const refreshTokenValue = getRefreshToken();
		console.log('[App] Initial refresh token check:', {
			hasToken: !!refreshTokenValue,
			tokenRefreshAttempted,
			isAuthenticated,
			autoLoginAttempted: autoLoginAttempted.current,
		});

		if (!refreshTokenValue && !tokenRefreshAttempted) {
			console.log(
				'[App] No initial token found, marking auto-login as completed'
			);
			autoLoginAttempted.current = true;
			// Устанавливаем флаг в Redux, что попытка автологина завершена
			dispatch(setAutoLoginAttempted());
		} else if (tokenRefreshAttempted) {
			// Если в Redux уже есть флаг, что проверка была выполнена
			console.log(
				'[App] Auto login already attempted according to Redux state'
			);
			autoLoginAttempted.current = true;
		}
	}, [dispatch, tokenRefreshAttempted, isAuthenticated]);

	// Отдельный эффект для автологина, выполняется только если есть токен
	useEffect(() => {
		// Проверяем, что еще не выполнялась попытка автологина и не было установлено в Redux
		if (!autoLoginAttempted.current && !tokenRefreshAttempted) {
			const refreshTokenValue = getRefreshToken();

			// Только если есть токен, не было попытки автологина и пользователь не авторизован
			if (refreshTokenValue && !isAuthenticated) {
				console.log('[App] Token found, attempting auto-login');
				autoLoginAttempted.current = true; // Устанавливаем флаг сразу, чтобы избежать повторного вызова

				dispatch(refreshToken())
					.unwrap()
					.then(() => {
						console.log('[App] Auto-login successful');
						return dispatch(fetchUser()).unwrap();
					})
					.then((userData) => {
						console.log('[App] User data fetched successfully');
					})
					.catch((err) => {
						console.error('[App] Auto-login failed:', err);
						// Clear token on auto-login failure
						removeRefreshToken();
						// Даже при ошибке устанавливаем флаг в Redux
						dispatch(setAutoLoginAttempted());
					});
			}
		}
	}, [dispatch, isAuthenticated, tokenRefreshAttempted]);

	// Отладочный эффект для логирования состояния
	useEffect(() => {
		console.log('[App] Auth check state:', {
			autoLoginAttempted: autoLoginAttempted.current,
			tokenRefreshAttempted,
			isAuthenticated,
		});
	}, [isAuthenticated, tokenRefreshAttempted]);

	// Don't render routes until auto-login attempt is completed
	// Используем как local state так и Redux state для определения, завершена ли проверка
	if (!autoLoginAttempted.current && !tokenRefreshAttempted) {
		console.log('[App] Showing auth preloader, still checking auth status');
		return <Preloader message='Проверка авторизации...' />;
	}

	console.log('[App] Auth check complete, rendering main app');
	return (
		<div className={styles.app}>
			<AppHeader />
			<ModalSwitch />
			<Routes location={backgroundLocation || location}>
				<Route path='/' element={<MainPage />} />
				{/* Feed routes - public */}
				<Route path='/feed' element={<OrderFeedPage />} />
				<Route path='/feed/:number' element={<OrderInfoPage />} />

				{/* Anonymous routes - only for non-authenticated users */}
				<Route
					path='/login'
					element={<ProtectedRoute element={<LoginPage />} anonymous={true} />}
				/>
				<Route
					path='/register'
					element={
						<ProtectedRoute element={<RegisterPage />} anonymous={true} />
					}
				/>
				<Route
					path='/forgot-password'
					element={
						<ProtectedRoute element={<ForgotPasswordPage />} anonymous={true} />
					}
				/>
				<Route
					path='/reset-password'
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
					path='/profile/*'
					element={<ProtectedRoute element={<ProfilePage />} />}
				/>
				<Route
					path='/profile/orders'
					element={<ProtectedRoute element={<OrderHistoryPage />} />}
				/>
				<Route
					path='/profile/orders/:number'
					element={<ProtectedRoute element={<OrderInfoPage />} />}
				/>

				{/* Public routes */}
				<Route path='/ingredients/:id' element={<IngredientPage />} />
				<Route path='*' element={<NotFoundPage />} />
			</Routes>

			{/* Modal routes */}
			{backgroundLocation && (
				<Routes>
					<Route path='/ingredients/:id' element={<ModalIngredientDetails />} />
					<Route path='/feed/:number' element={<ModalFeedOrderDetails />} />
					<Route path='/profile/orders/:number' element={<ModalProfileOrderDetails />} />
				</Routes>
			)}
		</div>
	);
};

export const App: React.FC = () => {
	return (
		<Router>
			<AppWithAuth />
		</Router>
	);
};
