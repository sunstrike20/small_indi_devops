import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-ingredients.module.scss';
import { selectBun, selectIngredients as selectConstructorIngredients } from '@services/constructor/constructorSlice';
import { setCurrentIngredient } from '@services/ingredient-details/ingredientDetailsSlice';
import { selectIngredients } from '@services/ingredients/ingredientsSlice';
import DraggableIngredient from './draggable-ingredient';
import { useNavigate, useLocation } from 'react-router-dom';
import { Ingredient, ConstructorIngredient } from '@utils/types';
import { AppDispatch } from '@utils/store-types';

type TabValue = 'bun' | 'sauce' | 'main';

const BurgerIngredients: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState<TabValue>('bun');
  
  const bunRef = useRef<HTMLHeadingElement>(null);
  const sauceRef = useRef<HTMLHeadingElement>(null);
  const mainRef = useRef<HTMLHeadingElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const ingredients = useSelector(selectIngredients);
  const constructorBun = useSelector(selectBun);
  const constructorIngredients = useSelector(selectConstructorIngredients);

  const getCount = (ingredient: Ingredient): number => {
    if (ingredient.type === 'bun') {
      return constructorBun && constructorBun._id === ingredient._id ? 2 : 0;
    }
    
    return constructorIngredients.filter(item => item._id === ingredient._id).length;
  };
  
  const handleTabClick = (value: TabValue): void => {
    setCurrent(value);
    const element = value === 'bun' 
      ? bunRef.current 
      : value === 'sauce' 
        ? sauceRef.current 
        : mainRef.current;
    
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCardClick = (ingredient: Ingredient): void => {
    dispatch(setCurrentIngredient(ingredient));
    navigate(`/ingredients/${ingredient._id}`, { 
      state: { backgroundLocation: location }
    });
  };

  // Слушатель скролла для автоматического переключения вкладок
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !bunRef.current || !sauceRef.current || !mainRef.current) {
        return;
      }
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const bunRect = bunRef.current.getBoundingClientRect();
      const sauceRect = sauceRef.current.getBoundingClientRect();
      const mainRect = mainRef.current.getBoundingClientRect();
      
      const bunDistance = Math.abs(containerRect.top - bunRect.top);
      const sauceDistance = Math.abs(containerRect.top - sauceRect.top);
      const mainDistance = Math.abs(containerRect.top - mainRect.top);
      
      const minDistance = Math.min(bunDistance, sauceDistance, mainDistance);
      
      if (minDistance === bunDistance) {
        setCurrent('bun');
      } else if (minDistance === sauceDistance) {
        setCurrent('sauce');
      } else {
        setCurrent('main');
      }
    };
    
    const scrollContainer = containerRef.current;
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <section className={styles.section}>
      <h1 className={`${styles.title} text text_type_main-large`}>Соберите бургер</h1>
      
      <div className={styles.tabs}>
        <Tab value="bun" active={current === 'bun'} onClick={() => handleTabClick('bun')}>
          Булки
        </Tab>
        <Tab value="sauce" active={current === 'sauce'} onClick={() => handleTabClick('sauce')}>
          Соусы
        </Tab>
        <Tab value="main" active={current === 'main'} onClick={() => handleTabClick('main')}>
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