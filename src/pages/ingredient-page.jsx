import { useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { IngredientDetails } from '../components/ingredient-details/ingredient-details';
import { setCurrentIngredient } from '../services/ingredient-details/ingredientDetailsSlice';
import styles from './ingredient-page.module.scss';

const IngredientPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  
  // Check if this is a direct navigation or modal state
  const isModal = location.state?.backgroundLocation;
  
  // Get ingredients from store
  const ingredients = useSelector(state => state.ingredients.items);
  const ingredientsLoading = useSelector(state => state.ingredients.loading);
  const ingredient = useSelector(state => 
    state.ingredients.items.find(item => item._id === id)
  );
  
  // Set the current ingredient in the store if needed
  useEffect(() => {
    if (ingredient && !isModal) {
      dispatch(setCurrentIngredient(ingredient));
    }
  }, [dispatch, ingredient, isModal]);

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
      <h1 className={`text text_type_main-large ${styles.title}`}>Детали ингредиента</h1>
      <IngredientDetails ingredient={ingredient} />
    </div>
  );
};

export default IngredientPage; 