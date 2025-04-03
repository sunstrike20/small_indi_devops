import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-ingredients.module.scss';
import { selectBun, selectIngredients as selectConstructorIngredients } from '@services/constructor/constructorSlice';
import { setCurrentIngredient } from '@services/ingredient-details/ingredientDetailsSlice';
import { selectIngredients } from '@services/ingredients/ingredientsSlice';
import DraggableIngredient from './draggable-ingredient';

const BurgerIngredients = () => {
  const dispatch = useDispatch();
  const [current, setCurrent] = useState('bun');
  
  const bunRef = useRef(null);
  const sauceRef = useRef(null);
  const mainRef = useRef(null);
  const containerRef = useRef(null);
  
  const ingredients = useSelector(selectIngredients);
  const constructorBun = useSelector(selectBun);
  const constructorIngredients = useSelector(selectConstructorIngredients);

  const getCount = (ingredient) => {
    if (ingredient.type === 'bun') {
      return constructorBun && constructorBun._id === ingredient._id ? 2 : 0;
    }
    
    return constructorIngredients.filter(item => item._id === ingredient._id).length;
  };
  
  const handleTabClick = (value) => {
    setCurrent(value);
    const element = value === 'bun' 
      ? bunRef.current 
      : value === 'sauce' 
        ? sauceRef.current 
        : mainRef.current;
    
    element.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCardClick = (ingredient) => {
    dispatch(setCurrentIngredient(ingredient));
  };
  

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === bunRef.current) {
              setCurrent('bun');
            } else if (entry.target === sauceRef.current) {
              setCurrent('sauce');
            } else if (entry.target === mainRef.current) {
              setCurrent('main');
            }
          }
        });
      },
      { root: container, threshold: 0.5 }
    );
    
    if (bunRef.current) observer.observe(bunRef.current);
    if (sauceRef.current) observer.observe(sauceRef.current);
    if (mainRef.current) observer.observe(mainRef.current);
    
    return () => {
      if (bunRef.current) observer.unobserve(bunRef.current);
      if (sauceRef.current) observer.unobserve(sauceRef.current);
      if (mainRef.current) observer.unobserve(mainRef.current);
    };
  }, []);

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
      
      <div className={styles.tabContent} ref={containerRef}>
        <div className={styles.category}>
          <h2 ref={bunRef} className={`${styles.categoryTitle} text text_type_main-medium`}>Булки</h2>
          <div className={styles.items}>
            {ingredients
              .filter(item => item.type === 'bun')
              .map(item => (
                <DraggableIngredient
                  key={item._id}
                  ingredient={item}
                  count={getCount(item)}
                  onClick={() => handleCardClick(item)}
                />
              ))}
          </div>
        </div>
        
        <div className={styles.category}>
          <h2 ref={sauceRef} className={`${styles.categoryTitle} text text_type_main-medium`}>Соусы</h2>
          <div className={styles.items}>
            {ingredients
              .filter(item => item.type === 'sauce')
              .map(item => (
                <DraggableIngredient
                  key={item._id}
                  ingredient={item}
                  count={getCount(item)}
                  onClick={() => handleCardClick(item)}
                />
              ))}
          </div>
        </div>
        
        <div className={styles.category}>
          <h2 ref={mainRef} className={`${styles.categoryTitle} text text_type_main-medium`}>Начинки</h2>
          <div className={styles.items}>
            {ingredients
              .filter(item => item.type === 'main')
              .map(item => (
                <DraggableIngredient
                  key={item._id}
                  ingredient={item}
                  count={getCount(item)}
                  onClick={() => handleCardClick(item)}
                />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BurgerIngredients;