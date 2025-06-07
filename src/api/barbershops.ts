import apiClient from "./client";
// const api = "http://localhost:8000/api";

export const barbershopsAPI = {
  // Получить все барбершопы
  getAll: (params?: any) => apiClient.get("/barbershops/", { params }),

  // Получить барбершоп по ID
  getById: (barbershopId: string) =>
    apiClient.get(`/barbershops/${barbershopId}/`),

  // Создать барбершоп
  create: (data: FormData) => apiClient.post("/barbershops/", data),

  // Обновить барбершоп
  update: (id: string, data: FormData) =>
    apiClient.patch(`/barbershops/${id}/`, data),

  // Удалить барбершоп
  delete: (id: string) => apiClient.delete(`/barbershops/${id}/`),

  // Получить барберов барбершопа
  getBarbers: (barbershopId: string) =>
    apiClient.get(`/barbershops/${barbershopId}/barbers/`),

  // Получить услуги барбершопа
  getServices: (barbershopId: string) =>
    apiClient.get(`/barbershops/${barbershopId}/services/`),
};
