import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { EmailInput, Button } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './form.module.scss';
import { request } from '../utils/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
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

  const handleSubmit = async (e) => {
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

      if (response.success) {
        setIsSuccess(true);
        // Store the fact that the password reset email was sent
        localStorage.setItem('passwordResetEmailSent', 'true');
      }
    } catch (err) {
      setError(err.message || 'Произошла ошибка при отправке запроса');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h1 className={`text text_type_main-medium ${styles.title}`}>Восстановление пароля</h1>
        
        <div className={styles.inputs}>
          <EmailInput
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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