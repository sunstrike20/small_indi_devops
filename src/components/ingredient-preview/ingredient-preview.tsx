import React from 'react';
import styles from './ingredient-preview.module.scss';

interface IngredientItem {
  _id: string;
  name: string;
  image: string;
  price: number;
}

interface IngredientPreviewProps {
  ingredients: IngredientItem[];
  maxVisible?: number;
}

export const IngredientPreview: React.FC<IngredientPreviewProps> = ({ 
  ingredients, 
  maxVisible = 6 
}) => {
  const visibleIngredients = ingredients.slice(0, maxVisible);
  const hiddenCount = ingredients.length - maxVisible;

  return (
    <div className={styles.ingredientsContainer}>
      {visibleIngredients.map((ingredient, index) => (
        <div 
          key={`${ingredient._id}-${index}`}
          className={styles.ingredientPreview}
          style={{ zIndex: maxVisible - index }}
        >
          <div className={styles.illustration}>
            <img 
              src={ingredient.image} 
              alt={ingredient.name}
              className={styles.img}
            />
          </div>
          
          {/* Show count overlay for the last visible ingredient if there are more */}
          {index === maxVisible - 1 && hiddenCount > 0 && (
            <div className={styles.moreOverlay}>
              <div className={styles.dim} />
              <div className={styles.ingredientsCount}>
                +{hiddenCount}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}; 