import React, { useEffect } from 'react';
import { useParams, useLocation, Location } from 'react-router-dom';
import { IngredientDetails } from '../components/ingredient-details/ingredient-details';
import { setCurrentIngredient } from '../services/ingredient-details/ingredientDetailsSlice';
import styles from './ingredient-page.module.scss';
import { Ingredient, RootState } from '@utils/types';
import { useAppDispatch, useAppSelector } from '@utils/store-types';

interface LocationState {
	backgroundLocation?: Location;
}

const IngredientPage: React.FC = () => {
	const params = useParams();
	const id = params.id;
	const dispatch = useAppDispatch();
	const location = useLocation() as Location & { state: LocationState };

	// Check if this is a direct navigation or modal state
	const isModal = location.state?.backgroundLocation;

	// Get ingredients from store
	const ingredients = useAppSelector(
		(state: RootState) => state.ingredients.items
	);
	const ingredientsLoading = useAppSelector(
		(state: RootState) => state.ingredients.loading
	);
	const ingredient = useAppSelector((state: RootState) =>
		state.ingredients.items.find((item: Ingredient) => item._id === id)
	);

	// Set the current ingredient in the store if needed
	useEffect(() => {
		if (ingredient && !isModal) {
			dispatch(setCurrentIngredient(ingredient));
		}
	}, [dispatch, ingredient, isModal, id]);

	if (ingredientsLoading) {
		return <div className={styles.loading}>Загрузка ингредиентов...</div>;
	}

	if (!ingredient && ingredients.length > 0) {
		return <div className={styles.loading}>Ингредиент не найден</div>;
	}

	if (!ingredient) {
		return <div className={styles.loading}>Загрузка...</div>;
	}

	return (
		<div className={styles.container}>
			<h1 className={`text text_type_main-large ${styles.title}`}>
				Детали ингредиента
			</h1>
			<IngredientDetails ingredient={ingredient} />
		</div>
	);
};

export default IngredientPage;
