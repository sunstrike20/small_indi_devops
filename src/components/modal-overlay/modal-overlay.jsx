import React from 'react';
import PropTypes from 'prop-types';
import styles from './modal-overlay.module.scss';

export const ModalOverlay = ({ onClick }) => {
  const handleClick = (e) => {
    // Убеждаемся, что клик был именно по оверлею, а не по вложенным элементам
    if (e.target === e.currentTarget) {
      onClick();
    }
  };

  return <div className={styles.overlay} onClick={handleClick} />;
};

ModalOverlay.propTypes = {
  onClick: PropTypes.func.isRequired
};