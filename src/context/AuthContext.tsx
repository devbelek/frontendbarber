// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

              // Создаем новый временный токен
              const newToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
              localStorage.setItem('token', newToken);
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
    try {
      setLoading(true);

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

      // Получаем избранные услуги
      let favorites: string[] = [];
      try {
        const favoritesResponse = await favoritesAPI.getAll();
        favorites = favoritesResponse.data.map((favorite: any) => favorite.service);
      } catch (err) {
        console.warn('Failed to fetch favorites:', err);
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
    }
  };

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
      setError(
        err.response?.data?.detail ||
        'Не удалось выполнить вход. Проверьте ваши учетные данные.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Implementing the missing register function
  const register = async (userData: any): Promise<void> => {
    setError(null);
    try {
      setLoading(true);
      await authAPI.register(userData);

      // After successful registration, user needs to login
      // We don't automatically log them in for security reasons
      return;
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
      // Get the API URL from the environment or use a default
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      // Сначала регистрируем/обновляем пользователя на сервере
      const response = await axios.post(`${API_URL}/users/register-google/`, {
        email: googleUserInfo.email,
        first_name: googleUserInfo.given_name || googleUserInfo.name.split(' ')[0],
        last_name: googleUserInfo.family_name || googleUserInfo.name.split(' ').slice(1).join(' '),
        picture: googleUserInfo.picture
      });

      console.log('Регистрация через Google успешна:', response.data);

      // Создаем объект пользователя на основе данных с сервера
      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        profile: response.data.profile,
        favorites: []
      };

      // Генерируем временный JWT-подобный токен на стороне клиента
      const tempToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

      // Сохраняем токен и данные пользователя
      localStorage.setItem('token', tempToken);
      localStorage.setItem('googleUser', JSON.stringify(userData));

      // Обновляем состояние
      setUser(userData);

      // Перенаправляем на профиль с помощью window.location
      window.location.href = '/profile';
    } catch (error) {
      console.error('Ошибка при регистрации через Google:', error);
      alert('Не удалось завершить регистрацию через Google. Пожалуйста, попробуйте позже.');
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
        setUser, // Экспортируем setUser для возможности обновления пользователя извне
        isAuthenticated: !!user,
        login,
        loginWithGoogle,
        register,
        logout,
        toggleFavorite,
        loading,
        error
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