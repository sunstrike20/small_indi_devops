import { ThunkAction, ThunkDispatch } from '@reduxjs/toolkit';
import { AnyAction } from 'redux';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState } from './types';

// Типизация Thunk действий
export type AppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	AnyAction
>;

// Типизация диспетчера (для использования внутри компонентов)
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// Тип для API ответов
export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	[key: string]: any; // Разрешаем любые дополнительные поля, чтобы данные были в корне ответа
}

// Дополнительные типы для API запросов
export interface ApiError {
	success: boolean;
	message: string;
}

// Параметры запроса
export interface RequestOptions {
	method?: string;
	headers?: Record<string, string>;
	body?: string;
	withAuth?: boolean;
}

// Тип для данных регистрации
export interface RegisterData {
	email: string;
	password: string;
	name: string;
}

// Тип для данных авторизации
export interface LoginData {
	email: string;
	password: string;
}

// Тип для данных обновления пользователя
export interface UpdateUserData {
	email?: string;
	password?: string;
	name?: string;
}

// Тип для данных сброса пароля
export interface ResetPasswordData {
	password: string;
	token: string;
}

// Типизированные хуки для использования в компонентах
// Используйте эти хуки вместо useDispatch и useSelector из 'react-redux'
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
