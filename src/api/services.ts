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
  getAll: async (params?: any) => {
    try {
      const response = await apiClient.get('/services/', { params });
      console.log('API Response Structure:', response);
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  getById: (id: string) =>
    apiClient.get(`/services/${id}/`),

  create: (serviceData: FormData) =>
    apiClient.post('/services/', serviceData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  update: (id: string, serviceData: FormData) =>
    apiClient.put(`/services/${id}/`, serviceData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  delete: (id: string) =>
    apiClient.delete(`/services/${id}/`),

  createBooking: (bookingData: any) => {
    return bookingsAPI.create(bookingData);
  },
};

// Бронирования
export const bookingsAPI = {
  getAll: (params?: any) =>
    apiClient.get('/bookings/', { params }),

  getById: (id: string) =>
    apiClient.get(`/bookings/${id}/`),

  create: (bookingData: any) =>
    apiClient.post('/bookings/', bookingData),

  update: (id: string, bookingData: any) =>
    apiClient.put(`/bookings/${id}/`, bookingData),

  delete: (id: string) =>
    apiClient.delete(`/bookings/${id}/`),

  changeStatus: (id: string, status: string) =>
    apiClient.patch(`/bookings/${id}/`, { status }),
};

// Избранное
export const favoritesAPI = {
  getAll: (params?: any) =>
    apiClient.get('/profiles/favorites/', { params }),

  add: (serviceId: string) =>
    apiClient.post('/profiles/favorites/', { service: serviceId }),

  remove: (serviceId: string) =>
    apiClient.delete(`/profiles/favorites/${serviceId}/`),
};

// Профиль
export const profileAPI = {
  getProfile: () =>
    apiClient.get('/profiles/me/'),

  updateProfile: (profileData: any) =>
    apiClient.patch('/profiles/profile/update/', profileData),

  updateUserInfo: (userData: any) =>
    apiClient.patch('/auth/users/me/', userData),
};

// Барберы
export const barbersAPI = {
  getAll: (params?: any) =>
    apiClient.get('/profiles/barbers/', { params }),

  getById: (id: string) =>
    apiClient.get(`/profiles/barbers/${id}/`),

  getReviews: (barberId: string) =>
    apiClient.get(`/profiles/reviews/?barber=${barberId}`),

  addReview: (reviewData: any) =>
    apiClient.post('/profiles/reviews/', reviewData),
};