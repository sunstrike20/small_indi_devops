import styles from './ingredient-details.module.scss';
import PropTypes from 'prop-types';
import { IngredientType } from '@utils/types';

export const IngredientDetails = ({ ingredient }) => {
  return (
    <div className={styles.container}>
      <img
        src={ingredient.image_large}
        alt={ingredient.name}
        className={styles.image}
      />
      <h3 className={styles.name}>
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

IngredientDetails.propTypes = {
  ingredient: IngredientType.isRequired,
};