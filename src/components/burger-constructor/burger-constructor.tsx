import React, { useCallback, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
	ConstructorElement,
	Button,
	CurrencyIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-constructor.module.scss';
import {
	setBun,
	addIngredient,
	removeIngredient,
	moveIngredient as moveIngredientAction,
	selectBun,
	selectIngredients,
	selectTotalPrice,
	generateUuid,
} from '@services/constructor/constructorSlice';
import { createOrder, selectOrderLoading } from '@services/order/orderSlice';
import { selectIsAuthenticated } from '@services/auth/authSlice';
import DraggableConstructorElement from './draggable-constructor-element';
import {
	Ingredient,
	ConstructorIngredient,
	IngredientType,
	RootState,
} from '@utils/types';
import { useAppDispatch, useAppSelector } from '@utils/store-types';

// Интерфейс для объекта, который мы получаем при перетаскивании
interface DropItem {
	_id: string;
	name: string;
	price: number;
	image: string;
	type: string;
}

// Расширенный интерфейс для обеспечения совместимости с Ingredient
interface ExtendedIngredient
	extends Partial<
		Omit<Ingredient, '_id' | 'name' | 'price' | 'image' | 'type'>
	> {
	_id: string;
	name: string;
	price: number;
	image: string;
	type: string;
	proteins?: number;
	fat?: number;
	carbohydrates?: number;
	calories?: number;
	image_mobile?: string;
	image_large?: string;
	__v?: number;
}

export const BurgerConstructor: React.FC = () => {
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const bun = useAppSelector(selectBun);
	const ingredients = useAppSelector(selectIngredients);
	const totalPrice = useAppSelector(selectTotalPrice);
	const isAuthenticated = useAppSelector(selectIsAuthenticated);
	const isOrderLoading = useAppSelector(selectOrderLoading);

	const constructorState = useAppSelector(
		(state: RootState) => state.constructor
	);

	React.useEffect(() => {
		if (typeof constructorState === 'function') {
			dispatch({ type: 'constructor/init' });
		}
	}, [dispatch, constructorState]);

	const [{ isHover }, dropTarget] = useDrop<
		DropItem,
		{ dropped: boolean },
		{ isHover: boolean }
	>({
		accept: ['bun', 'ingredient'],
		drop(item: DropItem, monitor) {
			try {
				if (!item || !item._id || !item.name || !item.price || !item.image) {
					return { dropped: false };
				}

				// Создаем расширенный объект с дефолтными значениями для отсутствующих полей
				const extendedItem: ExtendedIngredient = {
					_id: item._id,
					name: item.name,
					price: item.price,
					image: item.image,
					type: item.type as IngredientType,
					proteins: 0,
					fat: 0,
					carbohydrates: 0,
					calories: 0,
					image_mobile: item.image,
					image_large: item.image,
					__v: 0,
				};

				if (item.type === 'bun') {
					dispatch(setBun(extendedItem as Ingredient));
				} else {
					dispatch(
						addIngredient({
							...extendedItem,
							uuid: generateUuid(),
						} as ConstructorIngredient)
					);
				}

				return { dropped: true };
			} catch (error) {
				return { dropped: false };
			}
		},
		collect: (monitor) => ({
			isHover: monitor.isOver(),
		}),
	});

	const handleDeleteIngredient = useCallback(
		(uuid: string) => {
			dispatch(removeIngredient(uuid));
		},
		[dispatch]
	);

	const handleCreateOrder = () => {
		if (!bun || ingredients.length === 0) return;

		if (!isAuthenticated) {
			navigate('/login', {
				state: { from: { pathname: location.pathname } },
			});
			return;
		}

		const orderIngredients = [
			bun._id,
			...ingredients.map((item) => item._id),
			bun._id,
		];

		dispatch(createOrder(orderIngredients));
	};

	const moveIngredient = useCallback(
		(dragIndex: number, hoverIndex: number) => {
			dispatch(moveIngredientAction({ dragIndex, hoverIndex }));
		},
		[dispatch]
	);

	const orderContent = useMemo(() => {
		return (
			<>
				<div className={styles.bun} data-testid="constructor-bun-top">
					{bun ? (
						<ConstructorElement
							type='top'
							isLocked={true}
							text={`${bun.name} (верх)`}
							price={bun.price}
							thumbnail={bun.image}
						/>
					) : (
						<div className={styles.placeholder}>
							<p className="text text_type_main-default text_color_inactive">
								Выберите булки
							</p>
						</div>
					)}
				</div>

				<div className={styles.scrollArea} data-testid="constructor-ingredients">
					{ingredients.length > 0 ? (
						ingredients.map((item, index: number) => (
							<DraggableConstructorElement
								key={item.uuid}
								item={item}
								index={index}
								handleDelete={handleDeleteIngredient}
								moveIngredient={moveIngredient}
							/>
						))
					) : (
						<p className='text text_type_main-default text_color_inactive'>
							Перетащите ингредиенты сюда
						</p>
					)}
				</div>

				<div className={`${styles.bun} ${styles.bunBottom}`} data-testid="constructor-bun-bottom">
					{bun ? (
						<ConstructorElement
							type='bottom'
							isLocked={true}
							text={`${bun.name} (низ)`}
							price={bun.price}
							thumbnail={bun.image}
						/>
					) : (
						<div className={styles.placeholder}>
							<p className="text text_type_main-default text_color_inactive">
								Выберите булки
							</p>
						</div>
					)}
				</div>
			</>
		);
	}, [bun, ingredients, handleDeleteIngredient, moveIngredient]);

	return (
		<section
			className={`${styles.section} ${isHover ? styles.hovering : ''}`}
			ref={dropTarget}
			data-test-id='burger-constructor'>
			<div className={styles.constructorElements}>{orderContent}</div>

			<div className={styles.total}>
				<div className={styles.price} data-testid="total-price">
					<span className='text text_type_digits-medium'>{totalPrice}</span>
					<CurrencyIcon type='primary' />
				</div>
				<Button
					htmlType='button'
					type='primary'
					size='large'
					onClick={handleCreateOrder}
					disabled={!bun || ingredients.length === 0 || isOrderLoading}
					data-testid="order-button">
					{isOrderLoading ? 'Оформляем...' : 'Оформить заказ'}
				</Button>
			</div>
		</section>
	);
};

export default BurgerConstructor;
