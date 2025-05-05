// api/services.ts
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Настраиваем axios для отправки токена с каждым запросом
const authAxios = axios.create({
  baseURL: API_URL,
});

authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API для профиля пользователя
export const profileAPI = {
  // Получить информацию о текущем пользователе
  getCurrentUser: () => authAxios.get('/auth/users/me/'),

  // Обновить информацию пользователя
  updateUserInfo: (data) => authAxios.patch('/auth/users/me/', data),

  // Обновить профиль пользователя
  updateProfile: (data) => authAxios.patch('/profiles/profile/update/', data),

  // Получить профиль барбера по ID
  getBarberProfile: (id) => authAxios.get(`/profiles/barbers/${id}/`),

  // Получить список всех барберов
  getAllBarbers: () => authAxios.get('/profiles/barbers/'),
};

// API для уведомлений Telegram
export const notificationsAPI = {
  // Регистрация телеграм-аккаунта барбера
  registerTelegramAccount: (data) => authAxios.post('/notifications/register-telegram/', data),

  // Проверка статуса регистрации в телеграм
  checkTelegramStatus: () => authAxios.get('/notifications/telegram-status/'),
};

// API для бронирований
export const bookingsAPI = {
  // Получить все бронирования пользователя
  getAll: () => authAxios.get('/bookings/'),

  // Создать новое бронирование
  create: (data) => authAxios.post('/bookings/', data),

  // Обновить статус бронирования
  updateStatus: (id, status) => authAxios.patch(`/bookings/${id}/`, { status }),

  // Отменить бронирование
  cancel: (id) => authAxios.patch(`/bookings/${id}/`, { status: 'cancelled' }),

  // Получить доступные слоты времени для барбера на определенную дату
  getAvailableSlots: (barberId, date) =>
    authAxios.get(`/bookings/available-slots/?barber=${barberId}&date=${date}`),

  // Создать бронирование (добавлена эта функция, которой не хватало)
  createBooking: (data) => authAxios.post('/bookings/', data),
};

// API для сервисов
export const servicesAPI = {
  getAll: (params = {}) => authAxios.get('/services/', { params }),
  getById: (id) => authAxios.get(`/services/${id}/`),
  create: (data) => authAxios.post('/services/', data),
  update: (id, data) => authAxios.patch(`/services/${id}/`, data),
  delete: (id) => authAxios.delete(`/services/${id}/`),
  // Добавляем метод для бронирования сервиса
  createBooking: (data) => authAxios.post('/bookings/', data),
};

// API для избранного
export const favoritesAPI = {
  getAll: () => authAxios.get('/profiles/favorites/'),
  add: (serviceId) => authAxios.post('/profiles/favorites/', { service: serviceId }),
  remove: (serviceId) => authAxios.delete(`/profiles/favorites/${serviceId}/remove/`),
};

// API для отзывов
export const reviewsAPI = {
  getForBarber: (barberId) => authAxios.get(`/profiles/reviews/?barber=${barberId}`),
  create: (data) => authAxios.post('/profiles/reviews/', data),
};

// API для геолокации
export const locationAPI = {
  getNearbyBarbers: (latitude, longitude, radius = 5) =>
    authAxios.get(`/services/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),

  getRecommendations: (latitude, longitude) =>
    authAxios.get(`/services/recommendations/?latitude=${latitude}&longitude=${longitude}`),
};

export const authAPI = {
  login: (credentials) => axios.post(`${API_URL}/auth/jwt/create/`, credentials),
  register: (userData) => axios.post(`${API_URL}/auth/users/`, userData),
  getCurrentUser: () => authAxios.get('/auth/users/me/'),
  resetPassword: (email) => axios.post(`${API_URL}/auth/users/reset_password/`, { email }),

  // Метод для проверки наличия токена и его валидности
  validateToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject('No token found');
    return authAxios.post('/auth/jwt/verify/', { token });
  },
};