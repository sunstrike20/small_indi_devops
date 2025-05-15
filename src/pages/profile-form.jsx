import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input, EmailInput, PasswordInput, Button } from '@ya.praktikum/react-developer-burger-ui-components';
import { selectUser, selectAuthLoading, selectAuthError, updateUser, clearError } from '../services/auth/authSlice';
import styles from './profile.module.scss';

const ProfileForm = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormChanged, setIsFormChanged] = useState(false);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setIsFormChanged(false);
    }
    
    return () => {
      dispatch(clearError());
    };
  }, [user, dispatch]);

  // Check if form is changed from original values
  useEffect(() => {
    if (user) {
      const isChanged = 
        name !== user.name || 
        email !== user.email || 
        password.length > 0;
      
      setIsFormChanged(isChanged);
    }
  }, [name, email, password, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormChanged) {
      return;
    }
    
    const userData = {
      name,
      email
    };
    
    // Only include password if it was changed
    if (password) {
      userData.password = password;
    }
    
    try {
      await dispatch(updateUser(userData)).unwrap();
      setPassword(''); // Clear password after update
      setIsFormChanged(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPassword('');
      setIsFormChanged(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputs}>
        <Input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon="EditIcon"
          disabled={isLoading}
        />
        <EmailInput
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Логин"
          icon="EditIcon"
          disabled={isLoading}
        />
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          icon="EditIcon"
          disabled={isLoading}
        />
      </div>
      
      {error && (
        <p className={`text text_type_main-default ${styles.error}`}>{error}</p>
      )}
      
      {isFormChanged && (
        <div className={styles.buttons}>
          <Button 
            htmlType="button" 
            type="secondary" 
            size="medium"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button 
            htmlType="submit" 
            type="primary" 
            size="medium"
            disabled={isLoading || !isFormChanged}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      )}
    </form>
  );
};

export default ProfileForm; 