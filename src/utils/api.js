import { BASE_URL } from './constants';

export const checkResponse = async (res) => {
  if (!res.ok) {
    throw new Error(`HTTP error! Status: ${res.status}`);
  }
  
  const data = await res.json();
  
  if (data.success === false) {
    throw new Error(data.message || 'Ошибка при выполнении запроса');
  }
  
  return data;
};

export const request = async (endpoint, options = {}) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  return checkResponse(res);
};
