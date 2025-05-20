// src/context/AuthContext.tsx с улучшенным механизмом управления запросами
import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
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
  loginWithGoogle: (userInfo: GoogleUserInfo) => Promise<void>;
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

  // Используем ref для отслеживания активных запросов
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastFetchTime = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 2000; // Увеличиваем минимальный интервал между запросами (2 секунды)

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    mountedRef.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const googleUser = localStorage.getItem('googleUser');

      // Проверяем минимальный интервал между запросами
      const now = Date.now();
      if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
        console.log('Слишком частые запросы, добавляем задержку');
        await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL));
      }

      if (token && !fetchingRef.current) {
        try {
          await fetchCurrentUser();
        } catch (err: any) {
          console.error('Error fetching user:', err);

          // Попробуем обновить токен, если есть refreshToken
          if (refreshToken) {
            try {
              const response = await authAPI.refreshToken(refreshToken);
              if (response.data && response.data.access) {
                localStorage.setItem('token', response.data.access);
                // Повторно пытаемся получить данные пользователя
                await fetchCurrentUser();
              }
            } catch (refreshErr) {
              console.error('Failed to refresh token:', refreshErr);
              // Если не удалось обновить токен, очищаем хранилище
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
            }
          }

          // Обработка 429 ошибки
          if (err?.response?.status === 429 || err?.isRateLimited) {
            const retryAfter = err.retryAfter || err.response?.headers?.['retry-after'] || 60;
            console.log(`Получена ошибка 429, ждем ${retryAfter} секунд`);
            setTimeout(() => {
              if (mountedRef.current) {
                fetchingRef.current = false;
              }
            }, retryAfter * 1000);
          }

          if (googleUser) {
            try {
              const userData = JSON.parse(googleUser);
              if (mountedRef.current) {
                setUser(userData);
              }
            } catch (parseErr) {
              console.error('Failed to parse Google user data:', parseErr);
              localStorage.removeItem('googleUser');
            }
          } else {
            localStorage.removeItem('token');
          }
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      } else if (googleUser) {
        try {
          const userData = JSON.parse(googleUser);
          const newToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          localStorage.setItem('token', newToken);

          if (mountedRef.current) {
            setUser(userData);
          }
        } catch (err) {
          console.error('Failed to parse Google user data:', err);
          localStorage.removeItem('googleUser');
        } finally {
          if (mountedRef.current) {
            setLoading(false);
          }
        }
      } else {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mountedRef.current = false;
    };
  }, []); // Только при монтировании

  const fetchCurrentUser = async () => {
    if (fetchingRef.current) return;

    // Проверяем минимальный интервал
    const now = Date.now();
    if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
      console.log('Слишком частые запросы к fetchCurrentUser, добавляем задержку');
      await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL));
    }

    try {
      fetchingRef.current = true;
      lastFetchTime.current = Date.now();
      setLoading(true);

      const googleUser = localStorage.getItem('googleUser');
      if (googleUser) {
        const userData = JSON.parse(googleUser);
        if (mountedRef.current) {
          setUser(userData);
        }
        return;
      }

      const response = await authAPI.getCurrentUser();

      let favorites: string[] = [];
      if (response && response.data && response.data.id) {
        try {
          const favoritesResponse = await favoritesAPI.getAll();
          if (favoritesResponse && favoritesResponse.data) {
            favorites = Array.isArray(favoritesResponse.data)
              ? favoritesResponse.data.map((favorite: any) => favorite.service)
              : [];
          }
        } catch (err: any) {
          console.warn('Failed to fetch favorites:', err);
          // Обработка 429 для избранного
          if (err?.response?.status === 429 || err?.isRateLimited) {
            console.log('Получена ошибка 429 при загрузке избранного');
          }
        }
      }

      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        profile: response.data.profile,
        favorites: favorites
      };

      if (mountedRef.current) {
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  };

  // Используем useCallback для предотвращения пересоздания функции
  const refreshUserData = useCallback(async () => {
    if (fetchingRef.current || loading) return;

    // Проверяем минимальный интервал
    const now = Date.now();
    if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
      console.log('Слишком частое обновление данных пользователя, добавляем задержку');
      await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL));
    }

    try {
      fetchingRef.current = true;
      lastFetchTime.current = Date.now();
      setLoading(true);

      const response = await authAPI.getCurrentUser();

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
        } catch (err: any) {
          console.warn('Failed to fetch favorites:', err);
          if (err?.response?.status === 429 || err?.isRateLimited) {
            console.log('Получена ошибка 429 при обновлении избранного');
          }
        }
      }

      // Получаем данные из localStorage для сохранения picture
      let picture = undefined;
      const googleUser = localStorage.getItem('googleUser');
      if (googleUser) {
        try {
          const parsedGoogleUser = JSON.parse(googleUser);
          picture = parsedGoogleUser.picture;
        } catch (e) {
          console.error('Failed to parse googleUser from localStorage:', e);
        }
      }

      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        profile: response.data.profile,
        favorites: favorites,
        picture: response.data.profile?.photo || picture
      };

      // Обновляем googleUser в localStorage если он есть
      if (googleUser) {
        try {
          const parsedGoogleUser = JSON.parse(googleUser);
          parsedGoogleUser.first_name = userData.first_name;
          parsedGoogleUser.last_name = userData.last_name;
          parsedGoogleUser.profile = userData.profile;
          localStorage.setItem('googleUser', JSON.stringify(parsedGoogleUser));
        } catch (e) {
          console.error('Failed to update googleUser in localStorage:', e);
        }
      }

      if (mountedRef.current) {
        setUser(userData);
      }
    } catch (err: any) {
      console.error('Failed to refresh user data:', err);
      if (err?.response?.status === 429 || err?.isRateLimited) {
        const retryAfter = err.retryAfter || err.response?.headers?.['retry-after'] || 60;
        console.log(`Получена ошибка 429 при обновлении данных пользователя, ждем ${retryAfter} секунд`);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [loading]);

  const login = async (userData: any): Promise<boolean> => {
    setError(null);
    try {
      setLoading(true);
      const response = await authAPI.login(userData);

      localStorage.setItem('token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }

      await fetchCurrentUser();
      return true;
    } catch (err: any) {
      console.error('Login failed:', err);

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
    } catch (err: any) {
      console.error('Registration failed:', err);
      let errorMessage = 'Failed to register. Please try again.';

      if (err.response && err.response.data) {
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

  const loginWithGoogle = async (userInfo: GoogleUserInfo) => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      try {
        // Пытаемся авторизоваться через Google
        const response = await authAPI.googleAuth(userInfo.email, 'client');

        if (response.data && response.data.access) {
          localStorage.setItem('token', response.data.access);
          if (response.data.refresh) {
            localStorage.setItem('refreshToken', response.data.refresh);
          }

          // Обновляем информацию о пользователе
          if (response.data.user) {
            localStorage.setItem('googleUser', JSON.stringify({
              ...response.data.user,
              picture: userInfo.picture
            }));
          }

          // Добавляем задержку перед получением данных пользователя
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Получаем данные пользователя с сервера
          await fetchCurrentUser();
        } else {
          // Если сервер не вернул токен, создаем временный в localStorage
          const tempToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          localStorage.setItem('token', tempToken);

          // Создаем объект User из данных Google
          const userData: User = {
            id: `google-${Date.now()}`,
            username: userInfo.email.split('@')[0],
            email: userInfo.email,
            first_name: userInfo.given_name || userInfo.name.split(' ')[0] || '',
            last_name: userInfo.family_name || (userInfo.name.split(' ').length > 1 ? userInfo.name.split(' ').slice(1).join(' ') : '') || '',
            profile: {
              user_type: 'client',
              phone: '',
              offers_home_service: false
            },
            favorites: [],
            picture: userInfo.picture,
            isGoogleUser: true
          };

          localStorage.setItem('googleUser', JSON.stringify(userData));
          setUser(userData);
        }
      } catch (error) {
        console.error('Ошибка аутентификации через сервер:', error);

        // В случае ошибки создаем временного пользователя
        const userData: User = {
          id: `google-${Date.now()}`,
          username: userInfo.email.split('@')[0],
          email: userInfo.email,
          first_name: userInfo.given_name || userInfo.name.split(' ')[0] || '',
          last_name: userInfo.family_name || (userInfo.name.split(' ').length > 1 ? userInfo.name.split(' ').slice(1).join(' ') : '') || '',
          profile: {
            user_type: 'client',
            phone: '',
            offers_home_service: false
          },
          favorites: [],
          picture: userInfo.picture,
          isGoogleUser: true
        };

        const tempToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('token', tempToken);
        localStorage.setItem('googleUser', JSON.stringify(userData));
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
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('googleUser');
    setUser(null);
  };

  const toggleFavorite = async (haircutId: string): Promise<void> => {
    if (loading || fetchingRef.current) {
      console.log("Дождитесь завершения предыдущего запроса...");
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!haircutId) {
      console.error('haircutId is undefined or empty in toggleFavorite');
      throw new Error('ID услуги не определен');
    }

    try {
      if (!user) {
        throw new Error('Необходимо войти в систему для добавления в избранное');
      }

      console.log('Toggle favorite for haircutId:', haircutId, 'Type:', typeof haircutId);
      const isFavorite = user.favorites?.includes(haircutId) || false;
      console.log('Is already favorite:', isFavorite);

      // Добавляем задержку для предотвращения слишком частых запросов
      await new Promise(resolve => setTimeout(resolve, 500));

      if (isFavorite) {
        console.log('Removing from favorites');
        await favoritesAPI.toggle(haircutId);
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            favorites: prevUser.favorites.filter(id => id !== haircutId)
          };
        });
      } else {
        console.log('Adding to favorites');
        await favoritesAPI.toggle(haircutId);
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            favorites: [...(prevUser.favorites || []), haircutId]
          };
        });
      }
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
      if (err?.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      if (err?.response?.status === 429 || err?.isRateLimited) {
        const retryAfter = err.retryAfter || err.response?.headers?.['retry-after'] || 60;
        console.log(`Получена ошибка 429 при изменении избранного, ждем ${retryAfter} секунд`);
      }
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