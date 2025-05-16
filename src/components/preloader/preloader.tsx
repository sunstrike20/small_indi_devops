import React, { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';
import styles from './preloader.module.scss';
import { PreloaderProps } from '@utils/types';

export const Preloader: React.FC<PreloaderProps> = ({ 
  size = 80, 
  color = '#4C4CFF', 
  loading = true, 
  message = null, 
  error = false 
}) => {
  const [dots, setDots] = useState<string>('');
  
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