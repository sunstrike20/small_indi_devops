import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate, useLocation, Location } from 'react-router-dom';
import {
	EmailInput,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import {
	login,
	selectAuthError,
	selectAuthLoading,
	selectIsAuthenticated,
	clearError,
} from '../services/auth/authSlice';
import styles from './form.module.scss';
import { useAppDispatch, useAppSelector } from '@utils/store-types';

interface LocationState {
	from?: { pathname: string };
}

const LoginPage: React.FC = () => {
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation() as Location & { state: LocationState };
	const isLoading = useAppSelector(selectAuthLoading);
	const error = useAppSelector(selectAuthError);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);

	// Get the path to redirect to after login (if any)
	const from = location.state?.from?.pathname || '/';

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate(from, { replace: true });
		}

		// Clear any existing errors on component mount
		return () => {
			dispatch(clearError());
		};
	}, [isAuthenticated, navigate, dispatch, from]);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!email || !password) {
			return;
		}

		try {
			await dispatch(login({ email, password })).unwrap();
			// After successful login, the useEffect will handle the redirect based on 'from'
		} catch (err) {
			// Error is already handled in the redux slice
			console.error('Login failed:', err);
		}
	};

	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
		setEmail(e.target.value);
	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
		setPassword(e.target.value);

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<h1 className={`text text_type_main-medium ${styles.title}`}>Вход</h1>

				<div className={styles.inputs}>
					<EmailInput
						value={email}
						onChange={handleEmailChange}
						placeholder='E-mail'
						disabled={isLoading}
					/>
					<PasswordInput
						value={password}
						onChange={handlePasswordChange}
						placeholder='Пароль'
						disabled={isLoading}
					/>
				</div>

				{error && (
					<p className={`text text_type_main-default ${styles.error}`}>
						{error}
					</p>
				)}

				<Button
					htmlType='submit'
					type='primary'
					size='medium'
					disabled={isLoading || !email || !password}>
					{isLoading ? 'Вход...' : 'Войти'}
				</Button>

				<div className={styles.links}>
					<p className='text text_type_main-default text_color_inactive'>
						Вы — новый пользователь?{' '}
						<Link to='/register' className={styles.link}>
							Зарегистрироваться
						</Link>
					</p>
					<p className='text text_type_main-default text_color_inactive'>
						Забыли пароль?{' '}
						<Link to='/forgot-password' className={styles.link}>
							Восстановить пароль
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};

export default LoginPage;
