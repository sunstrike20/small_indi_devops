import styles from './order-details.module.scss';
import { CheckMarkIcon } from '@ya.praktikum/react-developer-burger-ui-components';

export const OrderDetails = () => {
  // Тестовые данные для номера заказа
  const orderNumber = '034536';

  return (
    <div className={styles.container}>
      <p className={styles.orderNumber}>{orderNumber}</p>
      <p className={`${styles.title} text text_type_main-medium mt-8`}>идентификатор заказа</p>
      <div className={styles.iconContainer}>
        <div className={styles.iconBackground}>
          <CheckMarkIcon type="primary" />
        </div>
      </div>
      <p className={`${styles.description} text text_type_main-default`}>Ваш заказ начали готовить</p>
      <p className={`${styles.additionalInfo} text text_type_main-default text_color_inactive`}>
        Дождитесь готовности на орбитальной станции
      </p>
    </div>
  );
};