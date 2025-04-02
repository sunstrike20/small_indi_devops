import React, { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrop } from 'react-dnd';
import { ConstructorElement, Button, CurrencyIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-constructor.module.scss';
import { 
  setBun, 
  addIngredient, 
  removeIngredient, 
  moveIngredient as moveIngredientAction,
  selectBun, 
  selectIngredients, 
  selectTotalPrice,
  generateUuid
} from '@services/constructor/constructorSlice';
import { createOrder } from '@services/order/orderSlice';
import DraggableConstructorElement from './draggable-constructor-element';

export const BurgerConstructor = () => {
  const dispatch = useDispatch();
  const bun = useSelector(selectBun);
  const ingredients = useSelector(selectIngredients);
  const totalPrice = useSelector(selectTotalPrice);
  
  const constructorState = useSelector(state => state.constructor);
  
  React.useEffect(() => {
    if (typeof constructorState === 'function') {
      dispatch({ type: 'constructor/init' });
    }
  }, [dispatch, constructorState]);
  
  const [{ isHover }, dropTarget] = useDrop({
    accept: ['bun', 'ingredient'],
    drop(item, monitor) {
      try {
        if (!item || !item._id || !item.name || !item.price || !item.image) {
          return { dropped: false };
        }
        
        const safeItem = {
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          type: item.type
        };
        
        if (item.type === 'bun') {
          dispatch(setBun(safeItem));
        } else {
          dispatch(addIngredient({
            ...safeItem,
            uuid: generateUuid()
          }));
        }
        
        return { dropped: true };
      } catch (error) {
        return { dropped: false };
      }
    },
    collect: monitor => ({
      isHover: monitor.isOver()
    })
  });
  
  const handleDeleteIngredient = (uuid) => {
    dispatch(removeIngredient(uuid));
  };
  
  const handleCreateOrder = () => {
    if (!bun || ingredients.length === 0) return;
    
    const orderIngredients = [
      bun._id,
      ...ingredients.map(item => item._id),
      bun._id
    ];
    
    dispatch(createOrder(orderIngredients));
  };
  
  const moveIngredient = useCallback((dragIndex, hoverIndex) => {
    dispatch(moveIngredientAction({ dragIndex, hoverIndex }));
  }, [dispatch]);
  
  const orderContent = useMemo(() => {
    return (
      <>
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
          {ingredients.length > 0 ? (
            ingredients.map((item, index) => (
              <DraggableConstructorElement
                key={item.uuid}
                item={item}
                index={index}
                handleDelete={handleDeleteIngredient}
                moveIngredient={moveIngredient}
              />
            ))
          ) : (
            <p className="text text_type_main-default text_color_inactive">
              Перетащите ингредиенты сюда
            </p>
          )}
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
      </>
    );
  }, [bun, ingredients, handleDeleteIngredient, moveIngredient]);
  
  return (
    <section 
      className={`${styles.section} ${isHover ? styles.hovering : ''}`} 
      ref={dropTarget}
      data-test-id="burger-constructor"
    >
      <div className={styles.constructorElements}>
        {orderContent}
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
          onClick={handleCreateOrder}
          disabled={!bun || ingredients.length === 0}
        >
          Оформить заказ
        </Button>
      </div>
    </section>
  );
};

export default BurgerConstructor;
