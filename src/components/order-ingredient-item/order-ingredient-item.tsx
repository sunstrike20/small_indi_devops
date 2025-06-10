import React from 'react';
import { CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './order-ingredient-item.module.scss';

interface IngredientDetails {
  _id: string;
  name: string;
  image: string;
  price: number;
  count: number;
}

interface OrderIngredientItemProps {
  ingredient: IngredientDetails;
}

export const OrderIngredientItem: React.FC<OrderIngredientItemProps> = ({ ingredient }) => {
  const totalPrice = ingredient.price * ingredient.count;

  return (
    <div className={styles.ingredientItem}>
      <div className={styles.ingredientPreview}>
        <div className={styles.illustration}>
          <img 
            src={ingredient.image} 
            alt={ingredient.name}
            className={styles.img}
          />
        </div>
        {ingredient.count > 1 && (
          <div className={styles.ingredientsCount}>
            {ingredient.count}
          </div>
        )}
      </div>
      
      <div className={styles.name}>
        {ingredient.name}
      </div>
      
      <div className={styles.price}>
        <div className={styles.priceValue}>
          {totalPrice}
        </div>
        <CurrencyIcon type="primary" />
      </div>
    </div>
  );
}; 