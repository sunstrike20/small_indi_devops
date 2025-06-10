import React, { useState, useEffect, useRef } from 'react';
import {
	Routes,
	Route,
	useLocation,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	fetchUser,
	selectIsAuthenticated,
	selectAuthLoading,
	selectAuthError,
	selectUser,
} from '../services/auth/authSlice';
import styles from './profile.module.scss';
import ProfileForm from './profile-form';
import ProfileOrders from './profile-orders';
import { ProfileNavigation } from '../components/profile-navigation';
import { ProfileCaption } from '../components/profile-caption';
import { AppDispatch } from '@utils/store-types';

const ProfilePage: React.FC = () => {
	const dispatch = useDispatch<AppDispatch>();
	const location = useLocation();
	const isAuthenticated = useSelector(selectIsAuthenticated);
	const isLoading = useSelector(selectAuthLoading);
	const error = useSelector(selectAuthError);
	const user = useSelector(selectUser);

	const [errorDetails, setErrorDetails] = useState<string>('');
	const fetchAttempted = useRef<boolean>(false);

	// Fetch user data only once when component mounts
	useEffect(() => {
		if (!fetchAttempted.current) {
			console.log('[ProfilePage] Initial fetch attempt');
			fetchAttempted.current = true;

			if (!user) {
				console.log('[ProfilePage] User data not available, fetching...');
				dispatch(fetchUser())
					.unwrap()
					.then((data) => {
						console.log('[ProfilePage] User data fetched successfully');
						setErrorDetails('');
					})
					.catch((err) => {
						console.error('[ProfilePage] Failed to fetch user data:', err);
						setErrorDetails(err.toString());
						fetchAttempted.current = false; // Reset for retry
					});
			} else {
				console.log('[ProfilePage] User data already available:', user.name);
			}
		}
	}, [dispatch, user]); // Keep user dependency to detect changes

	const handleRetry = () => {
		setErrorDetails('');
		fetchAttempted.current = false; // Reset fetch flag
		dispatch(fetchUser());
	};

	// Render loading state
	if (isLoading) {
		return (
			<div className={styles.profileContainer}>
				<div className={styles.loadingMessage}>
					<p className='text text_type_main-medium'>Загрузка профиля...</p>
				</div>
			</div>
		);
	}

	// Render error state if there's an error and we're not loading
	if ((error || errorDetails) && !isLoading) {
		return (
			<div className={styles.profileContainer}>
				<div className={styles.errorMessage}>
					<p className='text text_type_main-medium'>
						Ошибка: {error || errorDetails}
					</p>
					<p className='text text_type_main-default text_color_inactive'>
						Статус авторизации:{' '}
						{isAuthenticated ? 'Авторизован' : 'Не авторизован'}
					</p>
					{user && (
						<p className='text text_type_main-default text_color_inactive'>
							Пользователь: {user.name} ({user.email})
						</p>
					)}
					<button className='button button_type_primary' onClick={handleRetry}>
						Попробовать снова
					</button>
				</div>
			</div>
		);
	}

	// Don't render until we have user data
	if (!user && !isLoading) {
		return (
			<div className={styles.profileContainer}>
				<div className={styles.loadingMessage}>
					<p className='text text_type_main-medium'>
						Данные пользователя не загружены
					</p>
					<button
						className='button button_type_primary mt-4'
						onClick={handleRetry}>
						Загрузить данные
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.profileContainer}>
			<ProfileNavigation />

			{/* Caption for description */}
			<ProfileCaption />

			<div className={styles.content}>
				<Routes>
					<Route path='/' element={<ProfileForm />} />
					<Route path='/orders' element={<ProfileOrders />} />
					<Route
						path='/orders/:id'
						element={
							<div className='text text_type_main-medium'>
								Детали заказа будут доступны в следующем спринте
							</div>
						}
					/>
				</Routes>
			</div>
		</div>
	);
};

export default ProfilePage;
