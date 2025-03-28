import { useEffect, useState } from 'react';
import { AppHeader } from '@components/app-header/app-header';
import BurgerIngredients from '../burger-ingredients/burger-ingredient';
import BurgerConstructor from '../burger-constructor/burger-constructor';
import { Modal } from '../modal/modal';
import { IngredientDetails } from '../ingredient-details/ingredient-details';
import { OrderDetails } from '../order-details/order-details';
import { Preloader } from '../preloader/preloader';
import styles from './app.module.scss';

const API_URL = 'https://norma.nomoreparties.space/api/ingredients';

export const App = () => {
    const [ingredients, setIngredients] = useState([]);
    const [status, setIngredientsStatus] = useState('loading');
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
    
    useEffect(() => {
        setIngredientsStatus('loading');
        fetch(API_URL)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                setIngredients(data.data);
                setIngredientsStatus('done');
            })
            .catch((error) => {
                setIngredientsStatus('error');
                console.log(error);
            });
    }, []);

    const handleIngredientClick = (ingredient) => {
        setSelectedIngredient(ingredient);
    };

    const handleCloseModal = () => {
        setSelectedIngredient(null);
        setIsOrderModalOpen(false);
    };

    const handleOrderClick = () => {
        setIsOrderModalOpen(true);
    };

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
                        <>
                            <BurgerIngredients 
                                ingredients={ingredients} 
                                onIngredientClick={handleIngredientClick} 
                            />
                            <BurgerConstructor 
                                ingredients={ingredients}
                                onOrderClick={handleOrderClick} 
                            />
                        </>
                    )}
                </div>
            </main>

            {selectedIngredient && (
                <Modal title="Детали ингредиента" onClose={handleCloseModal}>
                    <IngredientDetails ingredient={selectedIngredient} />
                </Modal>
            )}

            {isOrderModalOpen && (
                <Modal title="" onClose={handleCloseModal}>
                    <OrderDetails />
                </Modal>
            )}
        </div>
    );
};