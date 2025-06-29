import React from 'react';
import styles from './ingredient-details.module.scss';
import { IngredientDetailsProps } from '@utils/types';

export const IngredientDetails: React.FC<IngredientDetailsProps> = ({
	ingredient,
}) => {
	// Проверка наличия ингредиента
	if (!ingredient) {
		return (
			<p className='text text_type_main-medium'>
				Данные ингредиента не найдены
			</p>
		);
	}

	return (
		<div className={styles.container} data-testid="ingredient-details">
			<img
				src={ingredient.image_large}
				alt={ingredient.name}
				className={styles.image}
			/>
			<h3 className={`${styles.name} text text_type_main-medium`}>
				{ingredient.name}
			</h3>

			<div className={styles.nutritionFacts}>
				<div className={styles.nutritionItem}>
					<p className={styles.nutritionLabel}>Калории,ккал</p>
					<p className={styles.nutritionValue}>{ingredient.calories}</p>
				</div>
				<div className={styles.nutritionItem}>
					<p className={styles.nutritionLabel}>Белки, г</p>
					<p className={styles.nutritionValue}>{ingredient.proteins}</p>
				</div>
				<div className={styles.nutritionItem}>
					<p className={styles.nutritionLabel}>Жиры, г</p>
					<p className={styles.nutritionValue}>{ingredient.fat}</p>
				</div>
				<div className={styles.nutritionItem}>
					<p className={styles.nutritionLabel}>Углеводы, г</p>
					<p className={styles.nutritionValue}>{ingredient.carbohydrates}</p>
				</div>
			</div>
		</div>
	);
};
