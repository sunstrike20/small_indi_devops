import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Tab, CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-ingredients.module.scss';

const BurgerIngredients = ({ ingredients }) => {
  const [current, setCurrent] = useState('bun');
  
  const bunRef = useRef(null);
  const sauceRef = useRef(null);
  const mainRef = useRef(null);
  
  const handleTabClick = (value) => {
    setCurrent(value);
    const element = value === 'bun' 
      ? bunRef.current 
      : value === 'sauce' 
        ? sauceRef.current 
        : mainRef.current;
    
    element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <h1 className={`${styles.title} text text_type_main-large`}>Соберите бургер</h1>
      
      <div className={styles.tabs}>
        <Tab value="bun" active={current === 'bun'} onClick={handleTabClick}>
          Булки
        </Tab>
        <Tab value="sauce" active={current === 'sauce'} onClick={handleTabClick}>
          Соусы
        </Tab>
        <Tab value="main" active={current === 'main'} onClick={handleTabClick}>
          Начинки
        </Tab>
      </div>
      
      <div className={styles.tabContent}>
        <div className={styles.category}>
          <h2 ref={bunRef} className={`${styles.categoryTitle} text text_type_main-medium`}>Булки</h2>
          <div className={styles.items}>
            {ingredients
              .filter(item => item.type === 'bun')
              .map(item => (
                <div key={item._id} className={styles.card}>
                  <img src={item.image} alt={item.name} />
                  <div className={styles.price}>
                    <span className="text text_type_digits-default">{item.price}</span>
                    <CurrencyIcon type="primary" />
                  </div>
                  <p className={`${styles.name} text text_type_main-default`}>{item.name}</p>
                </div>
              ))}
          </div>
        </div>
        
        <div className={styles.category}>
          <h2 ref={sauceRef} className={`${styles.categoryTitle} text text_type_main-medium`}>Соусы</h2>
          <div className={styles.items}>
            {ingredients
              .filter(item => item.type === 'sauce')
              .map(item => (
                <div key={item._id} className={styles.card}>
                  <img src={item.image} alt={item.name} />
                  <div className={styles.price}>
                    <span className="text text_type_digits-default">{item.price}</span>
                    <CurrencyIcon type="primary" />
                  </div>
                  <p className={`${styles.name} text text_type_main-default`}>{item.name}</p>
                </div>
              ))}
          </div>
        </div>
        
        <div className={styles.category}>
          <h2 ref={mainRef} className={`${styles.categoryTitle} text text_type_main-medium`}>Начинки</h2>
          <div className={styles.items}>
            {ingredients
              .filter(item => item.type === 'main')
              .map(item => (
                <div key={item._id} className={styles.card}>
                  <img src={item.image} alt={item.name} />
                  <div className={styles.price}>
                    <span className="text text_type_digits-default">{item.price}</span>
                    <CurrencyIcon type="primary" />
                  </div>
                  <p className={`${styles.name} text text_type_main-default`}>{item.name}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

BurgerIngredients.propTypes = {
  ingredients: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['bun', 'main', 'sauce']).isRequired,
      proteins: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired,
      carbohydrates: PropTypes.number.isRequired,
      calories: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      image_mobile: PropTypes.string.isRequired,
      image_large: PropTypes.string.isRequired,
      __v: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default BurgerIngredients;