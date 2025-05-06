// src/api/services.ts
import apiClient from './client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// API для профиля пользователя
export const profileAPI = {
  // Получить информацию о текущем пользователе
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    if (!token) {
      return Promise.reject({
        response: {
          data: {
            detail: 'No authentication token found'
          }
        }
      });
    }
    return apiClient.get('/auth/users/me/');
  },

  // Обновить информацию пользователя
  updateUserInfo: (data) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return Promise.reject({
        response: {
          data: {
            detail: 'Учетные данные не были предоставлены. Пожалуйста, войдите в систему заново.'
          }
        }
      });
    }
    return apiClient.patch('/auth/users/me/', data);
  },

  // Обновить профиль пользователя
  updateProfile: (data) => apiClient.patch('/profiles/profile/update/', data),

  // Получить профиль барбера по ID
  getBarberProfile: (id) => apiClient.get(`/profiles/barbers/${id}/`),

  // Получить список всех барберов
  getAllBarbers: () => apiClient.get('/profiles/barbers/'),
};

// API для уведомлений Telegram
export const notificationsAPI = {
  // Регистрация телеграм-аккаунта барбера
  registerTelegramAccount: (data) => apiClient.post('/notifications/register-telegram/', data),

  // Проверка статуса регистрации в телеграм
  checkTelegramStatus: () => apiClient.get('/notifications/telegram-status/'),
};

// API для бронирований
export const bookingsAPI = {
  // Получить все бронирования пользователя
  getAll: () => apiClient.get('/bookings/'),

  // Создать новое бронирование
  create: (data) => apiClient.post('/bookings/', data),

  // Обновить статус бронирования
  updateStatus: (id, status) => apiClient.patch(`/bookings/${id}/`, { status }),

  // Отменить бронирование
  cancel: (id) => apiClient.patch(`/bookings/${id}/`, { status: 'cancelled' }),

  // Получить доступные слоты времени для барбера на определенную дату
  getAvailableSlots: (barberId, date) =>
    apiClient.get(`/bookings/available-slots/?barber=${barberId}&date=${date}`),

  // Создать бронирование
  createBooking: (data) => apiClient.post('/bookings/', data),
};

// API для сервисов
export const servicesAPI = {
  getAll: (params = {}) => apiClient.get('/services/', { params }),
  getById: (id) => apiClient.get(`/services/${id}/`),
  create: (data) => apiClient.post('/services/', data),
  update: (id, data) => apiClient.patch(`/services/${id}/`, data),
  delete: (id) => apiClient.delete(`/services/${id}/`),
  // Добавляем метод для бронирования сервиса
  createBooking: (data) => apiClient.post('/bookings/', data),
};

// API для избранного
export const favoritesAPI = {
  getAll: () => apiClient.get('/profiles/favorites/'),
  add: (serviceId) => apiClient.post('/profiles/favorites/', { service: serviceId }),
  remove: (serviceId) => apiClient.delete(`/profiles/favorites/${serviceId}/remove/`),
};

// API для отзывов
export const reviewsAPI = {
  getForBarber: (barberId) => apiClient.get(`/profiles/reviews/?barber=${barberId}`),
  create: (data) => apiClient.post('/profiles/reviews/', data),
};

// API для геолокации
export const locationAPI = {
  getNearbyBarbers: (latitude, longitude, radius = 5) =>
    apiClient.get(`/services/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),

  getRecommendations: (latitude, longitude) =>
    apiClient.get(`/services/recommendations/?latitude=${latitude}&longitude=${longitude}`),
};

export const authAPI = {
  login: (credentials) => axios.post(`${API_URL}/auth/jwt/create/`, credentials),
  register: (userData) => axios.post(`${API_URL}/auth/users/`, userData),
  getCurrentUser: () => apiClient.get('/auth/users/me/'),
  resetPassword: (email) => axios.post(`${API_URL}/auth/users/reset_password/`, { email }),

  // Обновление токена
  refreshToken: (refresh) => axios.post(`${API_URL}/auth/jwt/refresh/`, { refresh }),

  // Валидация токена
  validateToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject('No token found');

  // Проверяем, начинается ли токен с 'google-auth-' (наш временный токен)
    if (token.startsWith('google-auth-')) {
    // Для Google-токенов возвращаем успешный ответ без проверки на сервере
      return Promise.resolve({ data: { valid: true } });
    }

  // Для обычных токенов выполняем стандартную проверку
    return apiClient.post('/auth/jwt/verify/', { token });
  }