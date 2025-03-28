import styles from './modal-overlay.module.scss';
import PropTypes from 'prop-types';

export const ModalOverlay = ({ onClick }) => {
  return <div className={styles.overlay} onClick={onClick}></div>;
};

ModalOverlay.propTypes = {
  onClick: PropTypes.func.isRequired,
};