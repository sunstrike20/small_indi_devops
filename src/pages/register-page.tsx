import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	Input,
	EmailInput,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import {
	register,
	selectAuthError,
	selectAuthLoading,
	selectIsAuthenticated,
	clearError,
} from '../services/auth/authSlice';
import styles from './form.module.scss';
import { AppDispatch } from '@utils/store-types';

const RegisterPage: React.FC = () => {
	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');

	const dispatch = useDispatch<AppDispatch>();
	const navigate = useNavigate();
	const isLoading = useSelector(selectAuthLoading);
	const error = useSelector(selectAuthError);
	const isAuthenticated = useSelector(selectIsAuthenticated);

	// Redirect if already authenticated
	useEffect(() => {
		if (isAuthenticated) {
			navigate('/');
		}

		// Clear any existing errors on component mount
		return () => {
			dispatch(clearError());
		};
	}, [isAuthenticated, navigate, dispatch]);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!name || !email || !password) {
			return;
		}

		try {
			await dispatch(register({ name, email, password })).unwrap();
			navigate('/');
		} catch (err) {
			// Error is already handled in the redux slice
			console.error('Registration failed:', err);
		}
	};

	const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
		setName(e.target.value);
	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
		setEmail(e.target.value);
	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
		setPassword(e.target.value);

	return (
		<div className={styles.container}>
			<form className={styles.form} onSubmit={handleSubmit}>
				<h1 className={`text text_type_main-medium ${styles.title}`}>
					Регистрация
				</h1>

				<div className={styles.inputs}>
					<Input
						type='text'
						placeholder='Имя'
						value={name}
						onChange={handleNameChange}
						disabled={isLoading}
					/>
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
					disabled={isLoading || !name || !email || !password}>
					{isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
				</Button>

				<div className={styles.links}>
					<p className='text text_type_main-default text_color_inactive'>
						Уже зарегистрированы?{' '}
						<Link to='/login' className={styles.link}>
							Войти
						</Link>
					</p>
				</div>
			</form>
		</div>
	);
};

export default RegisterPage;
