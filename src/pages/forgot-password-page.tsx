import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailInput, Button } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './form.module.scss';
import { request } from '../utils/api';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  // Auto-redirect to reset-password after successful request
  useEffect(() => {
    if (isSuccess) {
      // Short delay to show success message before redirect
      const timeoutId = setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [isSuccess, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await request('/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (typeof response === 'object' && response !== null && 'success' in response && response.success) {
        setIsSuccess(true);
        // Store the fact that the password reset email was sent
        localStorage.setItem('passwordResetEmailSent', 'true');
      }
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value);

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={`text text_type_main-medium ${styles.title}`}>Восстановление пароля</h1>
        
        <div className={styles.inputs}>
          <EmailInput
            value={email}
            onChange={handleEmailChange}
            placeholder="Укажите e-mail"
            disabled={isLoading}
          />
        </div>
        
        {error && (
          <p className={`text text_type_main-default ${styles.error}`}>{error}</p>
        )}

        {isSuccess && (
          <p className={`text text_type_main-default ${styles.success}`}>
            Письмо для сброса пароля отправлено на вашу почту. Перенаправление...
          </p>
        )}
        
        <Button 
          htmlType="submit" 
          type="primary" 
          size="medium"
          disabled={!email || isLoading || isSuccess}
        >
          {isLoading ? 'Отправка...' : 'Восстановить'}
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

export default ForgotPasswordPage; 