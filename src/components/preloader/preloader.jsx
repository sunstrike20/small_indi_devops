import { ClipLoader } from 'react-spinners';
import PropTypes from 'prop-types';
import styles from './preloader.module.scss';

export const Preloader = ({ 
  size = 80, 
  color = '#4C4CFF', 
  loading = true, 
  message = null, 
  error = false 
}) => {
  return (
    <div className={styles.preloaderContainer}>
      {loading && (
        <ClipLoader 
          color={color} 
          size={size} 
          loading={loading} 
        />
      )}
      {message && (
        <p className={error ? styles.errorText : styles.loadingText}>
          {message}
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