import { Link } from 'react-router-dom';
import styles from './not-found.module.scss';

const NotFoundPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={`text text_type_main-large ${styles.title}`}>404</h1>
        <p className="text text_type_main-medium mb-6">Страница не найдена</p>
        <p className="text text_type_main-default text_color_inactive mb-10">
          Возможно, она была удалена или перемещена на другой адрес
        </p>
        <Link to="/" className={`${styles.link} text text_type_main-default`}>
          Вернуться на главную
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage; 