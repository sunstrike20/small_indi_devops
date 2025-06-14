import React from 'react';
import { Location } from 'react-router-dom';
import { Ingredient } from './types';

// Общие типы для UI компонентов

// Тип для стилей
export type StylesType = Record<string, string>;

// Типы для react-dnd
export interface DragSourceOptions {
	type: string;
	item: () => any;
	collect: (monitor: any) => any;
}

export interface DropTargetOptions {
	accept: string | string[];
	hover?: (item: any, monitor: any) => void;
	drop?: (item: any, monitor: any) => void;
	collect: (monitor: any) => any;
}

// Типы для маршрутизации
export interface LocationState {
	from?: Location;
	backgroundLocation?: Location;
}

// Типы для форм
export interface FormState {
	values: Record<string, string>;
	errors: Record<string, string>;
	isValid: boolean;
}

// Типы для валидации
export interface ValidationOptions {
	required?: boolean;
	minLength?: number;
	maxLength?: number;
	pattern?: RegExp;
	isEmail?: boolean;
	isPassword?: boolean;
}

// Типы для модальных окон
export interface ModalState {
	isOpen: boolean;
	content: React.ReactNode | null;
	title?: string;
}

// Тип для табов
export interface Tab {
	id: string;
	name: string;
	type?: string;
	content?: React.ReactNode;
}

// Тип для группы ингредиентов
export interface IngredientGroup {
	type: string;
	name: string;
	items: Ingredient[];
}

// Тип для счетчика ингредиентов
export type IngredientCounter = Record<string, number>;
