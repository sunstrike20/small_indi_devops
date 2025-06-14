import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-ingredients.module.scss';
import { DraggableIngredientProps, Ingredient } from '@utils/types';

const DraggableIngredient: React.FC<DraggableIngredientProps> = ({
	ingredient,
	count,
	onClick,
}) => {
	const ref = useRef<HTMLDivElement>(null);

	const [{ isDragging }, dragRef] = useDrag({
		type: ingredient.type === 'bun' ? 'bun' : 'ingredient',
		item: (): Partial<Ingredient> => {
			return {
				_id: ingredient._id,
				name: ingredient.name,
				price: ingredient.price,
				image: ingredient.image,
				type: ingredient.type,
			};
		},
		collect: (monitor) => ({
			isDragging: monitor.isDragging(),
		}),
	});

	dragRef(ref);

	return (
		<div
			ref={ref}
			className={`${styles.card} ${isDragging ? styles.dragging : ''}`}
			onClick={onClick}
			data-test-id={`ingredient-${ingredient._id}`}>
			{count > 0 && <div className={styles.count}>{count}</div>}
			<img src={ingredient.image} alt={ingredient.name} />
			<div className={styles.price}>
				<span className='text text_type_digits-default'>
					{ingredient.price}
				</span>
				<CurrencyIcon type='primary' />
			</div>
			<p className={`${styles.name} text text_type_main-default`}>
				{ingredient.name}
			</p>
		</div>
	);
};

export default DraggableIngredient;
