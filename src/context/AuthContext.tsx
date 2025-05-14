// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authAPI, favoritesAPI } from '../api/services';
import axios from 'axios';

type GoogleUserInfo = {
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
};

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (userData: any) => Promise<boolean>;
  loginWithGoogle: (userInfo: GoogleUserInfo) => void;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  toggleFavorite: (haircutId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshUserData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Добавляем флаг для предотвращения повторных запросов
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const googleUser = localStorage.getItem('googleUser');

      if (token) {
        try {
          // Пробуем получить данные текущего пользователя
          await fetchCurrentUser();
        } catch (err) {
          console.error('Error fetching user:', err);

          // Проверяем, есть ли Google-пользователь и обновляем токен
          if (googleUser) {
            try {
              const userData = JSON.parse(googleUser);
              setUser(userData);
            } catch (parseErr) {
              console.error('Failed to parse Google user data:', parseErr);
              localStorage.removeItem('googleUser');
            }
          } else {
            // Если нет Google-пользователя, удаляем токен
            localStorage.removeItem('token');
          }
        } finally {
          setLoading(false);
        }
      } else if (googleUser) {
        // Если есть данные Google-пользователя, но нет токена, восстанавливаем сессию
        try {
          const userData = JSON.parse(googleUser);

          // Создаем новый временный токен
          const newToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          localStorage.setItem('token', newToken);

          setUser(userData);
        } catch (err) {
          console.error('Failed to parse Google user data:', err);
          localStorage.removeItem('googleUser');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchCurrentUser = async () => {
    if (isRefreshing) return; // Защита от повторных запросов

    try {
      setLoading(true);
      setIsRefreshing(true);

      // Проверяем, не является ли пользователь Google-пользователем
      const googleUser = localStorage.getItem('googleUser');
      if (googleUser) {
        // Просто восстанавливаем данные Google-пользователя
        const userData = JSON.parse(googleUser);
        setUser(userData);
        return; // Прерываем выполнение функции
      }

      // Для обычных пользователей получаем данные с сервера
      const response = await authAPI.getCurrentUser();

      // Получаем избранные услуги - с защитой от ошибок
      let favorites: string[] = [];
      // Только если пользователь авторизован и у нас есть его данные
      if (response && response.data && response.data.id) {
        try {
          const favoritesResponse = await favoritesAPI.getAll();
          if (favoritesResponse && favoritesResponse.data) {
            favorites = Array.isArray(favoritesResponse.data)
              ? favoritesResponse.data.map((favorite: any) => favorite.service)
              : [];
          }
        } catch (err) {
          console.warn('Failed to fetch favorites:', err);
          // НЕ выбрасываем ошибку дальше, только логируем
        }
      }

      // Преобразуем данные пользователя
      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        profile: response.data.profile,
        favorites: favorites
      };

      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      throw err; // Передаем ошибку дальше для обработки в checkAuth
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Используем useCallback для предотвращения пересоздания функции
  const refreshUserData = useCallback(async () => {
    if (isRefreshing || loading) return; // Добавляем защиту от параллельных запросов

    try {
      setIsRefreshing(true);
      setLoading(true);

      // Получаем актуальные данные пользователя
      const response = await authAPI.getCurrentUser();

      // Получаем избранные услуги с защитой от ошибок
      let favorites: string[] = [];
      if (response && response.data && response.data.id) {
        try {
          const favoritesResponse = await favoritesAPI.getAll();
          if (favoritesResponse && favoritesResponse.data) {
            favorites = Array.isArray(favoritesResponse.data)
              ? favoritesResponse.data.map((favorite: any) => favorite.service)
              : (favoritesResponse.data.results
                  ? favoritesResponse.data.results.map((favorite: any) => favorite.service)
                  : []);
          }
        } catch (err) {
          console.warn('Failed to fetch favorites:', err);
          // Не выбрасываем ошибку, просто продолжаем с пустым списком
        }
      }

      // Преобразуем данные пользователя
      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        profile: response.data.profile,
        favorites: favorites,
        // Для Google-пользователей сохраняем фото
        picture: localStorage.getItem('googleUser')
          ? JSON.parse(localStorage.getItem('googleUser') || '{}').picture
          : undefined
      };

      // Обновляем информацию о пользователе в localStorage для Google-пользователей
      if (localStorage.getItem('googleUser')) {
        const googleUser = JSON.parse(localStorage.getItem('googleUser') || '{}');
        // Обновляем информацию
        googleUser.first_name = userData.first_name;
        googleUser.last_name = userData.last_name;
        googleUser.profile = userData.profile;
        localStorage.setItem('googleUser', JSON.stringify(googleUser));
      }

      setUser(userData);
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [loading, isRefreshing]);

  const login = async (userData: any): Promise<boolean> => {
    setError(null);
    try {
      setLoading(true);
      const response = await authAPI.login(userData);

      // Сохраняем токены в localStorage
      localStorage.setItem('token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }

      // Получаем данные пользователя
      await fetchCurrentUser();
      return true;
    } catch (err: any) {
      console.error('Login failed:', err);

      // Отображаем ошибку
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          setError(err.response.data.detail);
        } else if (err.response.data.non_field_errors) {
          setError(err.response.data.non_field_errors.join(', '));
        } else {
          setError('Ошибка входа. Проверьте свои учетные данные.');
        }
      } else {
        setError('Не удалось соединиться с сервером. Пожалуйста, проверьте свое подключение.');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any): Promise<void> => {
    setError(null);
    try {
      setLoading(true);
      await authAPI.register(userData);
      // После успешной регистрации пользователю нужно войти
    } catch (err: any) {
      console.error('Registration failed:', err);
      let errorMessage = 'Failed to register. Please try again.';

      if (err.response && err.response.data) {
        // Format error message from API response if available
        const errorData = err.response.data;
        if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (typeof errorData === 'object') {
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
          errorMessage = errorMessages || errorMessage;
        }
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleUserInfo: GoogleUserInfo) => {
    try {
      setLoading(true);
      // Get the API URL from the environment or use a default
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      // Сначала пробуем получить JWT-токен от сервера
      try {
        // Отправляем запрос на бэкенд для аутентификации через Google
        const response = await axios.post(`${API_URL}/users/register-google/`, {
          email: googleUserInfo.email,
          first_name: googleUserInfo.given_name || googleUserInfo.name.split(' ')[0],
          last_name: googleUserInfo.family_name || googleUserInfo.name.split(' ').slice(1).join(' '),
          picture: googleUserInfo.picture
        });

        console.log('Регистрация через Google успешна:', response.data);

        // Если сервер вернул корректный JWT-токен, используем его
        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          if (response.data.refresh_token) {
            localStorage.setItem('refreshToken', response.data.refresh_token);
          }
        }

        // Создаем объект пользователя на основе данных с сервера
        const userData: User = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          profile: response.data.profile,
          favorites: [],
          picture: googleUserInfo.picture // Добавляем URL фото из Google
        };

        // Сохраняем данные пользователя
        localStorage.setItem('googleUser', JSON.stringify(userData));

        // Обновляем состояние
        setUser(userData);
      } catch (error) {
        console.error('Ошибка аутентификации через сервер:', error);

        // Если не удалось получить JWT-токен, используем локальную аутентификацию
        const userData: User = {
          id: `google-${Date.now()}`,
          username: googleUserInfo.email.split('@')[0],
          email: googleUserInfo.email,
          first_name: googleUserInfo.given_name || googleUserInfo.name.split(' ')[0],
          last_name: googleUserInfo.family_name || googleUserInfo.name.split(' ').slice(1).join(' '),
          profile: {
            user_type: 'barber',
            phone: '',
            offers_home_service: false
          },
          favorites: [],
          picture: googleUserInfo.picture,
          isGoogleUser: true
        };

        // Генерируем временный токен
        const tempToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('token', tempToken);
        localStorage.setItem('googleUser', JSON.stringify(userData));

        // Обновляем состояние
        setUser(userData);
      }
    } catch (error) {
      console.error('Ошибка при входе через Google:', error);
      setError('Не удалось завершить регистрацию через Google. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Удаляем все данные аутентификации
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('googleUser');
    setUser(null);
  };

  const toggleFavorite = async (haircutId: string): Promise<void> => {
    if (loading || isRefreshing) return; // Защита от параллельных запросов

    try {
      if (!user) {
        throw new Error('Необходимо войти в систему для добавления в избранное');
      }

      // Проверяем, есть ли уже эта услуга в избранном
      const isFavorite = user.favorites?.includes(haircutId) || false;

      if (isFavorite) {
        // Удаляем из избранного
        await favoritesAPI.remove(haircutId);
        // Обновляем список избранного в состоянии пользователя
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            favorites: prevUser.favorites.filter(id => id !== haircutId)
          };
        });
      } else {
        // Добавляем в избранное
        await favoritesAPI.add(haircutId);
        // Обновляем список избранного в состоянии пользователя
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            favorites: [...(prevUser.favorites || []), haircutId]
          };
        });
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        toggleFavorite,
        loading,
        error,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};