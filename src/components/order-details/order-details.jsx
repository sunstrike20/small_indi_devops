import { useSelector } from 'react-redux';
import styles from './order-details.module.scss';
import { CheckMarkIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { selectOrder, selectOrderLoading, selectOrderError } from '@services/order/orderSlice';
import { Preloader } from '../preloader/preloader';

export const OrderDetails = () => {
  const order = useSelector(selectOrder);
  const isLoading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Preloader message="Создание заказа..." />
        <p className={`${styles.loadingInfo} text text_type_main-default text_color_inactive mt-4`}>
          Запрос может выполняться до 20 секунд
        </p>
        <p className={`${styles.loadingPrompt} text text_type_main-default text_color_inactive mt-2`}>
          Пожалуйста, подождите...
        </p>
      </div>
    );
  }
  
  if (error) {
    return <Preloader loading={false} message={`Ошибка: ${error}`} error={true} />;
  }
  
  if (!order) {
    return <Preloader loading={false} message="Информация о заказе отсутствует" />;
  }

  return (
    <div className={styles.container}>
      <p className={styles.orderNumber}>{order.number}</p>
      <p className={`${styles.title} text text_type_main-medium mt-8`}>идентификатор заказа</p>
      <div className={styles.iconContainer}>
        <div className={styles.iconBackground}>
          <CheckMarkIcon type="primary" />
        </div>
      </div>
      <p className={`${styles.description} text text_type_main-default`}>
        Ваш заказ начали готовить
      </p>
      <p className={`${styles.additionalInfo} text text_type_main-default text_color_inactive`}>
        Дождитесь готовности на орбитальной станции
      </p>
    </div>
  );
};