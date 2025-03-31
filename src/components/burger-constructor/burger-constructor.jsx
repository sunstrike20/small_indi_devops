import PropTypes from 'prop-types';
import { ConstructorElement, Button, CurrencyIcon, DragIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-constructor.module.scss';
import { IngredientType } from '@utils/types';

export const BurgerConstructor = ({ ingredients, onOrderClick }) => {
  
  const bun = ingredients.find(item => item.type === 'bun');
  
  const fillings = ingredients.filter(item => item.type !== 'bun').slice(0, 5);
  
  const totalPrice = 444;
  
  return (
    <section className={styles.section}>
      <div className={styles.constructorElements}>
        {bun && (
          <div className={styles.bun}>
            <ConstructorElement
              type="top"
              isLocked={true}
              text={`${bun.name} (верх)`}
              price={bun.price}
              thumbnail={bun.image}
            />
          </div>
        )}
        
        <div className={styles.scrollArea}>
          {fillings.map((item, index) => (
            <div key={index} className={styles.ingredient}>
              <div className={styles.dragIcon}>
                <DragIcon type="primary" />
              </div>
              <ConstructorElement
                text={item.name}
                price={item.price}
                thumbnail={item.image}
              />
            </div>
          ))}
        </div>
        
        {bun && (
          <div className={`${styles.bun} ${styles.bunBottom}`}>
            <ConstructorElement
              type="bottom"
              isLocked={true}
              text={`${bun.name} (низ)`}
              price={bun.price}
              thumbnail={bun.image}
            />
          </div>
        )}
      </div>
      
      <div className={styles.total}>
        <div className={styles.price}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
        <Button 
          htmlType="button" 
          type="primary" 
          size="large"
          onClick={onOrderClick}
        >
          Оформить заказ
        </Button>
      </div>
    </section>
  );
};

BurgerConstructor.propTypes = {
  ingredients: PropTypes.arrayOf(IngredientType).isRequired,
  onOrderClick: PropTypes.func.isRequired
};

export default BurgerConstructor;
