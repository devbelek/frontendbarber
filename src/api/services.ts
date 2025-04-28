import apiClient from './client';

// Аутентификация
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/jwt/create/', { email, password }),

  register: (userData: any) =>
    apiClient.post('/auth/users/', userData),

  getCurrentUser: () =>
    apiClient.get('/auth/users/me/'),
};

// Услуги (стрижки)
export const servicesAPI = {
  getAll: (params?: any) =>
    apiClient.get('/services/', { params }),

  getById: (id: string) =>
    apiClient.get(`/services/${id}/`),
};

// Бронирования
export const bookingsAPI = {
  getAll: () =>
    apiClient.get('/bookings/'),

  create: (bookingData: any) =>
    apiClient.post('/bookings/', bookingData),
};

// Избранное
export const favoritesAPI = {
  getAll: () =>
    apiClient.get('/profiles/favorites/'),

  add: (serviceId: string) =>
    apiClient.post('/profiles/favorites/', { service: serviceId }),

  remove: (serviceId: string) =>
    apiClient.delete(`/profiles/favorites/${serviceId}/`),
};