import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { EmailInput, PasswordInput, Button } from '@ya.praktikum/react-developer-burger-ui-components';
import { login, selectAuthError, selectAuthLoading, selectIsAuthenticated, clearError } from '../services/auth/authSlice';
import styles from './form.module.scss';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Get the path to redirect to after login (if any)
  const from = location.state?.from || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
    
    // Clear any existing errors on component mount
    return () => {
      dispatch(clearError());
    };
  }, [isAuthenticated, navigate, dispatch, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    try {
      await dispatch(login({ email, password })).unwrap();
      // After successful login, the useEffect will handle the redirect based on 'from'
    } catch (err) {
      // Error is already handled in the redux slice
      console.error('Login failed:', err);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={`text text_type_main-medium ${styles.title}`}>Вход</h1>
        
        <div className={styles.inputs}>
          <EmailInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-mail"
            disabled={isLoading}
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className={`text text_type_main-default ${styles.error}`}>{error}</p>
        )}
        
        <Button 
          htmlType="submit" 
          type="primary" 
          size="medium"
          disabled={isLoading || !email || !password}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </Button>
        
        <div className={styles.links}>
          <p className="text text_type_main-default text_color_inactive">
            Вы — новый пользователь? <Link to="/register" className={styles.link}>Зарегистрироваться</Link>
          </p>
          <p className="text text_type_main-default text_color_inactive">
            Забыли пароль? <Link to="/forgot-password" className={styles.link}>Восстановить пароль</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage; 