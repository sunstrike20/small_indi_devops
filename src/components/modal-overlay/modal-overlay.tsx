import React, { MouseEvent } from 'react';
import styles from './modal-overlay.module.scss';
import { ModalOverlayProps } from '@utils/types';

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ onClick }) => {
  const handleClick = (e: MouseEvent<HTMLDivElement>): void => {
    // Убеждаемся, что клик был именно по оверлею, а не по вложенным элементам
    if (e.target === e.currentTarget) {
      onClick();
    }
  };

  return <div className={styles.overlay} onClick={handleClick} />;
}; 