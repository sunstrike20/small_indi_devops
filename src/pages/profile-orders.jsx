import React from 'react';
import styles from './profile.module.scss';

const ProfileOrders = () => {
  return (
    <div className={styles.ordersContainer}>
      <p className="text text_type_main-medium">
        История заказов будет доступна в следующем спринте
      </p>
    </div>
  );
};

export default ProfileOrders; 