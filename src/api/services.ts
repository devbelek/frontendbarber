// src/api/services.ts
import apiClient from './client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Демо-данные для случаев, когда API недоступен
const demoHaircuts = [
  {
    id: '1',
    image: 'https://images.pexels.com/photos/1576937/pexels-photo-1576937.jpeg',
    title: 'Классическая стрижка',
    price: 500,
    barber: 'Александр П.',
    barber_details: {
      id: 1,
      full_name: 'Александр Петров'
    },
    type: 'classic',
    length: 'short',
    style: 'business',
    location: 'Бишкек, Центр',
    duration: 30,
    is_favorite: false
  },
  {
    id: '2',
    image: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg',
    title: 'Фейд с текстурой',
    price: 600,
    barber: 'Максим К.',
    barber_details: {
      id: 2,
      full_name: 'Максим Кузнецов'
    },
    type: 'fade',
    length: 'short',
    style: 'modern',
    location: 'Бишкек, Восток',
    duration: 45,
    is_favorite: false
  },
  {
    id: '3',
    image: 'https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg',
    title: 'Андеркат',
    price: 650,
    barber: 'Руслан Д.',
    barber_details: {
      id: 3,
      full_name: 'Руслан Доскеев'
    },
    type: 'undercut',
    length: 'medium',
    style: 'trendy',
    location: 'Бишкек, Центр',
    duration: 35,
    is_favorite: false
  }
];

const demoBarbers = [
  {
    id: '1',
    username: 'alexander_p',
    first_name: 'Александр',
    last_name: 'Петров',
    profile: {
      photo: 'https://images.pexels.com/photos/1081188/pexels-photo-1081188.jpeg',
      user_type: 'barber',
      address: 'Бишкек, Центр'
    },
    avg_rating: 4.8,
    review_count: 124
  },
  {
    id: '2',
    username: 'maxim_k',
    first_name: 'Максим',
    last_name: 'Кузнецов',
    profile: {
      photo: 'https://images.pexels.com/photos/2182971/pexels-photo-2182971.jpeg',
      user_type: 'barber',
      address: 'Бишкек, Восток'
    },
    avg_rating: 4.9,
    review_count: 98
  },
  {
    id: '3',
    username: 'ruslan_d',
    first_name: 'Руслан',
    last_name: 'Доскеев',
    profile: {
      photo: 'https://images.pexels.com/photos/1853958/pexels-photo-1853958.jpeg',
      user_type: 'barber',
      address: 'Бишкек, Запад'
    },
    avg_rating: 4.7,
    review_count: 75
  }
];

// Функция для стандартной обработки API-ответов
function processApiResponse<T>(response: any): T[] {
  if (!response || !response.data) {
    return [];
  }

  // Проверяем, если данные в виде пагинации
  if (response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }

  // Если данные пришли как массив
  if (Array.isArray(response.data)) {
    return response.data;
  }

  console.error('Неожиданный формат ответа:', response.data);
  return [];
}

// API для профиля пользователя
export const profileAPI = {
  // Получить информацию о текущем пользователе
  getCurrentUser: () => {
    return apiClient.get('/auth/users/me/');
  },

  // Обновить информацию пользователя
  updateUserInfo: async (data) => {
    const response = await apiClient.patch('/auth/users/me/', data);
    return response;
  },

  // Обновить профиль пользователя
  updateProfile: async (data) => {
    const response = await apiClient.patch('/profiles/update/', data);
    return response;
  },

  // Получить профиль барбера по ID
  getBarberProfile: (id) => {
    return apiClient.get(`/profiles/barbers/${id}/`);
  },

  // Получить список всех барберов
  getAllBarbers: () => {
    console.log('Fetching barbers from backend API');
    return apiClient.get('/profiles/barbers/');
  },
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
  getAll: (params = {}) => {
    return apiClient.get('/services/', { params })
      .catch(error => {
        console.log("Using demo data for services due to error:", error);
        return { data: demoHaircuts };
      });
  },

  getById: (id) => {
    return apiClient.get(`/services/${id}/`)
      .catch(error => {
        console.log("Using demo data for service due to error:", error);
        return {
          data: demoHaircuts.find(h => h.id === id) || demoHaircuts[0]
        };
      });
  },

  // ИСПРАВЛЕНО: правильная обработка FormData без явного установления Content-Type
  create: (data) => {
    // Проверяем, что данные - это FormData
    if (data instanceof FormData) {
      console.log('Sending FormData with files');
      // Для FormData не нужно явно устанавливать Content-Type
      // axios автоматически установит правильный заголовок с boundary
      return apiClient.post('/services/', data);
    } else {
      // Для обычных JSON данных
      return apiClient.post('/services/', data);
    }
  },

  update: (id, data) => {
    // Проверяем, что данные - это FormData
    if (data instanceof FormData) {
      return apiClient.patch(`/services/${id}/`, data);
    } else {
      return apiClient.patch(`/services/${id}/`, data);
    }
  },

  delete: (id) => apiClient.delete(`/services/${id}/`),
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

  // Google аутентификация
  googleAuth: (token) => axios.post(`${API_URL}/auth/google/`, { token }),

  // Валидация токена
  validateToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject('No token found');

    return apiClient.post('/auth/jwt/verify/', { token });
  }
}