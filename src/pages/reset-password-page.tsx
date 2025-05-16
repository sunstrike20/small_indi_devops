import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, PasswordInput, Button } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './form.module.scss';
import { request } from '../utils/api';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  // Check if the user came from the forgot-password flow
  useEffect(() => {
    const passwordResetEmailSent = localStorage.getItem('passwordResetEmailSent');
    if (!passwordResetEmailSent) {
      // Redirect to forgot-password if the user didn't go through that step
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  // Auto-redirect to login after successful reset
  useEffect(() => {
    if (isSuccess) {
      // Short delay to show success message before redirect
      const timeoutId = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await request('/password-reset/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, token })
      });

      if (typeof response === 'object' && response !== null && 'success' in response && response.success) {
        setIsSuccess(true);
        // Clear the flag since the reset is complete
        localStorage.removeItem('passwordResetEmailSent');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при сбросе пароля');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);
  const handleTokenChange = (e: ChangeEvent<HTMLInputElement>) => setToken(e.target.value);

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={`text text_type_main-medium ${styles.title}`}>Восстановление пароля</h1>
        
        <div className={styles.inputs}>
          <PasswordInput
            value={password}
            onChange={handlePasswordChange}
            placeholder="Введите новый пароль"
            disabled={isLoading || isSuccess}
          />
          <Input
            type="text"
            placeholder="Введите код из письма"
            value={token}
            onChange={handleTokenChange}
            disabled={isLoading || isSuccess}
          />
        </div>
        
        {error && (
          <p className={`text text_type_main-default ${styles.error}`}>{error}</p>
        )}

        {isSuccess && (
          <p className={`text text_type_main-default ${styles.success}`}>
            Пароль успешно сброшен! Перенаправление на страницу входа...
          </p>
        )}
        
        <Button 
          htmlType="submit" 
          type="primary" 
          size="medium"
          disabled={!password || !token || isLoading || isSuccess}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        
        <div className={styles.links}>
          <p className="text text_type_main-default text_color_inactive">
            Вспомнили пароль? <Link to="/login" className={styles.link}>Войти</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordPage; 