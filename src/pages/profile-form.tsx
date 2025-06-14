import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import {
	Input,
	EmailInput,
	PasswordInput,
	Button,
} from '@ya.praktikum/react-developer-burger-ui-components';
import {
	selectUser,
	selectAuthLoading,
	selectAuthError,
	updateUser,
	clearError,
} from '../services/auth/authSlice';
import styles from './profile.module.scss';
import { useAppDispatch, useAppSelector } from '@utils/store-types';

interface UserUpdateData {
	name: string;
	email: string;
	password?: string;
}

const ProfileForm: React.FC = () => {
	const dispatch = useAppDispatch();
	const user = useAppSelector(selectUser);
	const isLoading = useAppSelector(selectAuthLoading);
	const error = useAppSelector(selectAuthError);

	const [name, setName] = useState<string>('');
	const [email, setEmail] = useState<string>('');
	const [password, setPassword] = useState<string>('');
	const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

	// Initialize form with user data
	useEffect(() => {
		if (user) {
			setName(user.name || '');
			setEmail(user.email || '');
			setPassword('');
			setIsFormChanged(false);
		}

		return () => {
			dispatch(clearError());
		};
	}, [user, dispatch]);

	// Check if form is changed from original values
	useEffect(() => {
		if (user) {
			const isChanged =
				name !== user.name || email !== user.email || password.length > 0;

			setIsFormChanged(isChanged);
		}
	}, [name, email, password, user]);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!isFormChanged) {
			return;
		}

		const userData: UserUpdateData = {
			name,
			email,
		};

		// Only include password if it was changed
		if (password) {
			userData.password = password;
		}

		try {
			await dispatch(updateUser(userData)).unwrap();
			setPassword(''); // Clear password after update
			setIsFormChanged(false);
		} catch (err) {
			console.error('Failed to update profile:', err);
		}
	};

	const handleCancel = () => {
		if (user) {
			setName(user.name || '');
			setEmail(user.email || '');
			setPassword('');
			setIsFormChanged(false);
		}
	};

	const handleNameChange = (e: ChangeEvent<HTMLInputElement>) =>
		setName(e.target.value);
	const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) =>
		setEmail(e.target.value);
	const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) =>
		setPassword(e.target.value);

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<div className={styles.inputs}>
				<Input
					type='text'
					placeholder='Имя'
					value={name}
					onChange={handleNameChange}
					icon='EditIcon'
					disabled={isLoading}
				/>
				<EmailInput
					value={email}
					onChange={handleEmailChange}
					placeholder='Логин'
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
				<p className={`text text_type_main-default ${styles.error}`}>{error}</p>
			)}

			{isFormChanged && (
				<div className={styles.buttons}>
					<Button
						htmlType='button'
						type='secondary'
						size='medium'
						onClick={handleCancel}
						disabled={isLoading}>
						Отмена
					</Button>
					<Button
						htmlType='submit'
						type='primary'
						size='medium'
						disabled={isLoading || !isFormChanged}>
						{isLoading ? 'Сохранение...' : 'Сохранить'}
					</Button>
				</div>
			)}
		</form>
	);
};

export default ProfileForm;
