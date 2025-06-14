import React from 'react';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './order-card.module.scss';

interface OrderCardProps {
	orderId: string;
	timestamp: string;
	name: string;
	ingredients: Array<{
		_id: string;
		name: string;
		image: string;
		price: number;
	}>;
	status?: 'created' | 'pending' | 'done';
	showStatus?: boolean; // Флаг для показа статуса
	totalPrice: number;
	onClick?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
	orderId,
	timestamp,
	name,
	ingredients,
	status,
	showStatus = true, // По умолчанию показываем статус
	totalPrice,
	onClick
}) => {
	const maxVisibleIngredients = 6;
	const visibleIngredients = ingredients.slice(0, maxVisibleIngredients);
	const hiddenCount = ingredients.length - maxVisibleIngredients;

	const formatOrderId = (id: string) => {
		return id.startsWith('#') ? id : `#${id}`;
	};

	const getStatusText = (status?: string) => {
		switch (status) {
			case 'done':
				return 'Выполнен';
			case 'pending':
				return 'Готовится';
			case 'created':
				return 'Создан';
			default:
				return '';
		}
	};

	const getStatusClass = (status?: string) => {
		switch (status) {
			case 'done':
				return styles.statusDone;
			case 'pending':
				return styles.statusPending;
			case 'created':
				return styles.statusCreated;
			default:
				return '';
		}
	};

	return (
		<div className={styles.orderCard} onClick={onClick}>
			<div className={styles.orderHeader}>
				<span className={styles.orderId}>{formatOrderId(orderId)}</span>
				<span className={styles.timestamp}>{timestamp}</span>
			</div>

			<div className={styles.orderInfo}>
				<h3 className={styles.burgerName}>{name}</h3>
				{status && showStatus && (
					<div className={`${styles.status} ${getStatusClass(status)}`}>
						{getStatusText(status)}
					</div>
				)}
			</div>

			<div className={styles.orderFooter}>
				<div className={styles.ingredients}>
					{visibleIngredients.map((ingredient, index) => {
						const isLast = index === maxVisibleIngredients - 1;
						const shouldShowMore = isLast && hiddenCount > 0;

						return (
							<div
								key={ingredient._id + index}
								className={styles.ingredientPreview}
								style={{ zIndex: maxVisibleIngredients - index }}
							>
								<img 
									src={ingredient.image} 
									alt={ingredient.name}
									className={styles.ingredientImage}
								/>
								{shouldShowMore && (
									<div className={styles.moreOverlay}>
										<span className={styles.moreCount}>+{hiddenCount}</span>
									</div>
								)}
							</div>
						);
					})}
				</div>
				<div className={styles.price}>
					<span className={styles.priceValue}>{totalPrice}</span>
					<div className={styles.priceIcon}>
						<CurrencyIcon type="primary" />
					</div>
				</div>
			</div>
		</div>
	);
}; 