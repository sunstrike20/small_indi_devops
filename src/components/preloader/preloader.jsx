import { ClipLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import styles from './preloader.module.scss';
import React, { useState, useEffect } from 'react';

export const Preloader = ({ 
  size = 80, 
  color = '#4C4CFF', 
  loading = true, 
  message = null, 
  error = false 
}) => {
  const [dots, setDots] = useState('');
  
  // Эффект для анимации точек в сообщении загрузки
  useEffect(() => {
    if (loading) {
      const intervalId = setInterval(() => {
        setDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);
      
      return () => clearInterval(intervalId);
    }
  }, [loading]);

  return (
    <div className={styles.preloaderContainer}>
      {loading && (
        <div className={styles.loaderWrapper}>
          <ClipLoader 
            color={color} 
            size={size} 
            loading={loading} 
          />
          <div className={styles.pulseEffect}></div>
        </div>
      )}
      {message && (
        <p className={error ? styles.errorText : styles.loadingText}>
          {loading ? `${message}${dots}` : message}
        </p>
      )}
    </div>
  );
};

Preloader.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
  loading: PropTypes.bool,
  message: PropTypes.string,
  error: PropTypes.bool
};