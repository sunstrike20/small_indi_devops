import React from 'react';
import { useLocation } from 'react-router-dom';
import styles from './profile-caption.module.scss';

export const ProfileCaption: React.FC = () => {
  const location = useLocation();

  const isProfileRoute = location.pathname === '/profile';
  const isOrdersRoute = location.pathname === '/profile/orders' || location.pathname.startsWith('/profile/orders/');

  const getCaptionText = () => {
    if (isProfileRoute) {
      return 'В этом разделе вы можете изменить свои персональные данные';
    } else if (isOrdersRoute) {
      return 'В этом разделе вы можете просмотреть свою историю заказов';
    }
    return '';
  };

  if (!getCaptionText()) {
    return null;
  }

  return (
    <div className={styles.caption}>
      {getCaptionText()}
    </div>
  );
}; 