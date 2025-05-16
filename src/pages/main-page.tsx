import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import BurgerIngredients from '../components/burger-ingredients/burger-ingredient';
import { BurgerConstructor } from '../components/burger-constructor/burger-constructor';
import styles from '../components/app/app.module.scss';

const MainPage: React.FC = () => {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <DndProvider backend={HTML5Backend}>
          <BurgerIngredients />
          <BurgerConstructor />
        </DndProvider>
      </div>
    </main>
  );
};

export default MainPage; 