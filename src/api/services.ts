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

  if (response.data.results && Array.isArray(response.data.results)) {
    return response.data.results;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  console.error('Неожиданный формат ответа:', response.data);
  return [];
}

export const profileAPI = {
  getCurrentUser: () => apiClient.get('/auth/users/me/'),
  updateUserInfo: (data: any) => apiClient.patch('/auth/users/me/', data),
  updateProfile: (data: any) =>
    data instanceof FormData
      ? apiClient.patch('/users/profile/update/', data)
      : apiClient.patch('/users/profile/update/', data),
  getBarberProfile: (id: string) => apiClient.get(`/profiles/barbers/${id}/`),
  getAllBarbers: () => {
    console.log('Fetching barbers from backend API');
    return apiClient.get('/profiles/barbers/');
  }
};

export const notificationsAPI = {
  registerTelegramAccount: (data: any) => apiClient.post('/notifications/register-telegram/', data),
  checkTelegramStatus: () => apiClient.get('/notifications/telegram-status/')
};

export const bookingsAPI = {
  getAll: () => apiClient.get('/bookings/'),
  create: (data: any) => apiClient.post('/bookings/', data),
  updateStatus: (id: string, status: string) => apiClient.patch(`/bookings/${id}/`, { status }),
  cancel: (id: string) => apiClient.patch(`/bookings/${id}/`, { status: 'cancelled' }),
  getAvailableSlots: (barberId: string, date: string) =>
    apiClient.get(`/bookings/available-slots/?barber=${barberId}&date=${date}`),
  createBooking: (data: any) => apiClient.post('/bookings/', data),
  delete: (id: string) => apiClient.delete(`/bookings/${id}/`)
};

export const servicesAPI = {
  getAll: (params: any = {}) =>
    apiClient.get('/services/', { params }).catch((error: any) => {
      console.log('Using demo data for services due to error:', error);
      return { data: demoHaircuts };
    }),

  getById: (id: string) =>
    apiClient.get(`/services/${id}/`).catch((error: any) => {
      console.log('Using demo data for service due to error:', error);
      return { data: demoHaircuts.find((h) => h.id === id) || demoHaircuts[0] };
    }),

  incrementViews: (id: string | number) => {
    if (!id) {
      console.error(`Invalid ID provided: ${id}`);
      return Promise.reject(new Error('Invalid service ID'));
    }
    const serviceId = String(id);
    console.log(`Incrementing views for service ID: ${serviceId}`);
    return apiClient.post(`/services/${serviceId}/increment_views/`);
  },

  getPopular: () =>
    apiClient.get('/services/', { params: { limit: 6, ordering: '-views' } }).catch((error: any) => {
      console.log('Using demo data for popular services due to error:', error);
      return { data: demoHaircuts };
    }),

  create: (data: any) => {
    // Добавляем обработку FormData
    if (data instanceof FormData) {
      // Логируем для отладки
      console.log("Creating service with FormData:", Array.from(data.entries()));
      return apiClient.post('/services/', data);
    }
    return apiClient.post('/services/', data);
  },

  update: (id: string, data: any) => {
    // Добавляем обработку FormData
    if (data instanceof FormData) {
      // Логируем для отладки
      console.log(`Updating service ${id} with FormData:`, Array.from(data.entries()));
      return apiClient.patch(`/services/${id}/`, data);
    }
    return apiClient.patch(`/services/${id}/`, data);
  },

  delete: (id: string) => apiClient.delete(`/services/${id}/`)
};

export const favoritesAPI = {
  getAll: () => apiClient.get('/profiles/favorites/'),
  add: (serviceId: string) => apiClient.post('/profiles/favorites/toggle/', { service: serviceId }),
  remove: (serviceId: string) => {
    if (!serviceId) {
      console.error('serviceId is undefined in favoritesAPI.remove');
      return Promise.reject(new Error('serviceId is undefined'));
    }
    return apiClient.post('/profiles/favorites/toggle/', { service: serviceId });
  },
  toggle: (serviceId: string) => {
    if (!serviceId) {
      console.error('serviceId is undefined in favoritesAPI.toggle');
      return Promise.reject(new Error('serviceId is undefined'));
    }
    return apiClient.post('/profiles/favorites/toggle/', { service: serviceId });
  }
};

export const reviewsAPI = {
  getForBarber: (barberId: string) => apiClient.get(`/profiles/reviews/?barber=${barberId}`),
  create: (data: any) => apiClient.post('/profiles/reviews/', data)
};

export const locationAPI = {
  getNearbyBarbers: (latitude: number, longitude: number, radius: number = 5) =>
    apiClient.get(`/services/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),
  getRecommendations: (latitude: number, longitude: number) =>
    apiClient.get(`/services/recommendations/?latitude=${latitude}&longitude=${longitude}`)
};

export const authAPI = {
  login: (credentials: any) => axios.post(`${API_URL}/auth/jwt/create/`, credentials),
  register: (userData: any) => axios.post(`${API_URL}/auth/users/`, userData),
  getCurrentUser: () => apiClient.get('/auth/users/me/'),
  resetPassword: (email: string) => axios.post(`${API_URL}/auth/users/reset_password/`, { email }),
  refreshToken: (refresh: string) => axios.post(`${API_URL}/auth/jwt/refresh/`, { refresh }),
  registerClient: (userData: any) => axios.post(`${API_URL}/users/register/`, userData),
  loginClient: (credentials: any) => axios.post(`${API_URL}/users/login/`, credentials),
  googleAuth: (token: string, userType: 'client' | 'barber' = 'client') =>
    axios.post(`${API_URL}/users/auth/google/`, { token, user_type: userType }),
  validateToken: () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.reject('No token found');
    return apiClient.post('/auth/jwt/verify/', { token });
  }
};