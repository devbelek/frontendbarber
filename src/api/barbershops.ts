// src/api/barbershops.ts
import apiClient from './client';

export const barbershopsAPI = {
  // Получить все барбершопы
  getAll: (params?: any) => apiClient.get('/barbershops/', { params }),

  // Получить барбершоп по ID
  getById: (id: string) => apiClient.get(`/barbershops/${id}/`),

  // Создать барбершоп
  create: (data: FormData) => apiClient.post('/barbershops/', data),

  // Обновить барбершоп
  update: (id: string, data: FormData) => apiClient.patch(`/barbershops/${id}/`, data),

  // Удалить барбершоп
  delete: (id: string) => apiClient.delete(`/barbershops/${id}/`),

  // Добавить барбера в барбершоп
  addBarber: (barbershopId: string, barberId: string) =>
    apiClient.post(`/barbershops/${barbershopId}/add-barber/`, { barber_id: barberId }),

  // Удалить барбера из барбершопа
  removeBarber: (barbershopId: string, barberId: string) =>
    apiClient.post(`/barbershops/${barbershopId}/remove-barber/`, { barber_id: barberId }),

  // Получить барберов барбершопа
  getBarbers: (barbershopId: string) =>
    apiClient.get(`/barbershops/${barbershopId}/barbers/`),

  // Получить услуги барбершопа
  getServices: (barbershopId: string) =>
    apiClient.get(`/barbershops/${barbershopId}/services/`),
};