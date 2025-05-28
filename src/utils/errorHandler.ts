export class ApiError extends Error {
  constructor(public statusCode: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any): string => {
  if (error.response) {
    // Ошибка от сервера
    const { status, data } = error.response;

    if (status === 401) {
      return 'Необходима авторизация';
    }

    if (status === 403) {
      return 'Доступ запрещен';
    }

    if (status === 404) {
      return 'Данные не найдены';
    }

    if (status === 422 || status === 400) {
      if (typeof data === 'object') {
        const errors = Object.entries(data)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value.join(', ');
            }
            return String(value);
          })
          .filter(Boolean)
          .join('. ');

        return errors || 'Неверные данные';
      }

      return data.detail || data.message || 'Неверный запрос';
    }

    if (status >= 500) {
      return 'Ошибка сервера. Попробуйте позже';
    }

    return data.detail || data.message || 'Произошла ошибка';
  }

  if (error.request) {
    // Запрос был сделан, но ответ не получен
    return 'Нет соединения с сервером';
  }

  // Что-то произошло при настройке запроса
  return error.message || 'Произошла неизвестная ошибка';
};