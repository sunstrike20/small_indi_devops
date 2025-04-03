import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AppHeader } from '@components/app-header/app-header';
import BurgerIngredients from '../burger-ingredients/burger-ingredient';
import BurgerConstructor from '../burger-constructor/burger-constructor';
import { Modal } from '../modal/modal';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { OrderDetails } from '../order-details/order-details';
import { Preloader } from '../preloader/preloader';
import styles from './app.module.scss';
import { fetchIngredients, selectIngredientsLoading, selectIngredientsError } from '@services/ingredients/ingredientsSlice';
import { selectCurrentIngredient, clearCurrentIngredient } from '@services/ingredient-details/ingredientDetailsSlice';
import { selectOrder, clearOrder } from '@services/order/orderSlice';

export const App = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectIngredientsLoading) || false;
    const error = useSelector(selectIngredientsError);
    const selectedIngredient = useSelector(selectCurrentIngredient);
    const order = useSelector(selectOrder);
    
    useEffect(() => {
        dispatch(fetchIngredients());
    }, [dispatch]);

    const handleCloseModal = () => {
        if (selectedIngredient) {
            dispatch(clearCurrentIngredient());
        }
        if (order) {
            dispatch(clearOrder());
        }
    };

    const status = loading ? 'loading' : error ? 'error' : 'done';

    return (
        <div className={styles.app}>
            <AppHeader />
            <main className={styles.main}>
                <div className={styles.container}>
                    {status === 'loading' && (
                        <Preloader message="Загрузка ингредиентов..." />
                    )}
                    {status === 'error' && (
                        <Preloader 
                            loading={false} 
                            message="Не удалось загрузить ингредиенты. Пожалуйста, попробуйте позже." 
                            error={true}
                        />
                    )}
                    {status === 'done' && (
                        <DndProvider backend={HTML5Backend}>
                            <BurgerIngredients />
                            <BurgerConstructor />
                        </DndProvider>
                    )}
                </div>
            </main>

            {selectedIngredient && (
                <Modal title="Детали ингредиента" onClose={handleCloseModal}>
                    <IngredientDetails ingredient={selectedIngredient} />
                </Modal>
            )}

            {order && (
                <Modal title="" onClose={handleCloseModal}>
                    <OrderDetails order={order} />
                </Modal>
            )}
        </div>
    );
};