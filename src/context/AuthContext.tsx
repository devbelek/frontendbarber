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

  // Refs для управления запросами и жизненным циклом
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastFetchTime = useRef<number>(0);
  const dataLoadedRef = useRef(false); // Добавлен для отслеживания загрузки данных
  const MIN_FETCH_INTERVAL = 5000; // Увеличен до 5 секунд

  // Проверка аутентификации при загрузке
  useEffect(() => {
    mountedRef.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const googleUser = localStorage.getItem('googleUser');

      // Проверка минимального интервала между запросами
      const now = Date.now();
      if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
        console.log('Слишком частые запросы, ждем задержку');
        await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL));
      }

      if (token && !fetchingRef.current) {
        try {
          fetchingRef.current = true;
          await fetchCurrentUser();
        } catch (err: any) {
          console.error('Ошибка получения пользователя:', err);

          // Пробуем обновить токен
          if (refreshToken) {
            try {
              const response = await authAPI.refreshToken(refreshToken);
              if (response.data && response.data.access) {
                localStorage.setItem('token', response.data.access);
                await fetchCurrentUser();
              }
            } catch (refreshErr) {
              console.error('Не удалось обновить токен:', refreshErr);
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
            }
          }

          // Обработка ошибки 429
          if (err?.response?.status === 429 || err?.isRateLimited) {
            const retryAfter = err.retryAfter || err.response?.headers?.['retry-after'] || 60;
            console.log(`Ошибка 429, ждем ${retryAfter} секунд`);
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            fetchingRef.current = false;
          }

          // Используем данные Google, если они есть
          if (googleUser) {
            try {
              const userData = JSON.parse(googleUser);
              if (mountedRef.current) setUser(userData);
            } catch (parseErr) {
              console.error('Ошибка парсинга Google данных:', parseErr);
              localStorage.removeItem('googleUser');
            }
          } else {
            localStorage.removeItem('token');
          }
        } finally {
          if (mountedRef.current) {
            setLoading(false);
            fetchingRef.current = false;
          }
        }
      } else if (googleUser) {
        try {
          const userData = JSON.parse(googleUser);
          const newToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
          localStorage.setItem('token', newToken);
          if (mountedRef.current) setUser(userData);
        } catch (err) {
          console.error('Ошибка парсинга Google данных:', err);
          localStorage.removeItem('googleUser');
        } finally {
          if (mountedRef.current) setLoading(false);
        }
      } else {
        if (mountedRef.current) setLoading(false);
      }
    };

    checkAuth();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Получение текущего пользователя
  const fetchCurrentUser = async () => {
    if (fetchingRef.current) return;

    const now = Date.now();
    if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
      console.log('Слишком частые запросы в fetchCurrentUser, ждем');
      await new Promise(resolve => setTimeout(resolve, MIN_FETCH_INTERVAL));
    }

    try {
      fetchingRef.current = true;
      lastFetchTime.current = Date.now();
      setLoading(true);

      const googleUser = localStorage.getItem('googleUser');
      if (googleUser) {
        const userData = JSON.parse(googleUser);
        if (mountedRef.current) setUser(userData);
        return;
      }

      const response = await authAPI.getCurrentUser();
      let favorites: string[] = [];

      if (response?.data?.id) {
        try {
          const favoritesResponse = await favoritesAPI.getAll();
          if (favoritesResponse?.data) {
            favorites = Array.isArray(favoritesResponse.data)
              ? favoritesResponse.data.map((favorite: any) => favorite.service)
              : [];
          }
        } catch (err: any) {
          console.warn('Не удалось загрузить избранное:', err);
          if (err?.response?.status === 429 || err?.isRateLimited) {
            console.log('Ошибка 429 при загрузке избранного');
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
        favorites,
      };

      if (mountedRef.current) setUser(userData);
    } catch (err) {
      console.error('Не удалось загрузить пользователя:', err);
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  };

  // Обновление данных пользователя
  const refreshUserData = useCallback(async () => {
    // Если уже идет запрос или загрузка, не делаем новый запрос
    if (fetchingRef.current || loading) {
      console.log('Уже идет запрос или загрузка, пропускаем обновление данных');
      return;
    }

    // Проверка минимального интервала между запросами
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;

    if (timeSinceLastFetch < MIN_FETCH_INTERVAL) {
      console.log(`Слишком частое обновление данных, ждем ${Math.floor((MIN_FETCH_INTERVAL - timeSinceLastFetch)/1000)} секунд`);
      return;
    }

    try {
      fetchingRef.current = true;
      lastFetchTime.current = now;
      setLoading(true);

      const response = await authAPI.getCurrentUser();
      let favorites: string[] = [];

      if (response?.data?.id) {
        try {
          const favoritesResponse = await favoritesAPI.getAll();
          if (favoritesResponse?.data) {
            favorites = Array.isArray(favoritesResponse.data)
              ? favoritesResponse.data.map((favorite: any) => favorite.service)
              : favoritesResponse.data.results?.map((favorite: any) => favorite.service) || [];
          }
        } catch (err: any) {
          console.warn('Не удалось обновить избранное:', err);
          if (err?.response?.status === 429 || err?.isRateLimited) {
            console.log('Ошибка 429 при обновлении избранного');
          }
        }
      }

      let picture: string | undefined;
      const googleUser = localStorage.getItem('googleUser');
      if (googleUser) {
        try {
          const parsedGoogleUser = JSON.parse(googleUser);
          picture = parsedGoogleUser.picture;
        } catch (e) {
          console.error('Ошибка парсинга googleUser:', e);
        }
      }

      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        profile: response.data.profile,
        favorites,
        picture: response.data.profile?.photo || picture,
      };

      if (googleUser) {
        try {
          const parsedGoogleUser = JSON.parse(googleUser);
          parsedGoogleUser.first_name = userData.first_name;
          parsedGoogleUser.last_name = userData.last_name;
          parsedGoogleUser.profile = userData.profile;
          localStorage.setItem('googleUser', JSON.stringify(parsedGoogleUser));
        } catch (e) {
          console.error('Ошибка обновления googleUser:', e);
        }
      }

      if (mountedRef.current) setUser(userData);
    } catch (err: any) {
      console.error('Не удалось обновить данные:', err);
      if (err?.response?.status === 429 || err?.isRateLimited) {
        const retryAfter = err.retryAfter || err.response?.headers?.['retry-after'] || 60;
        console.log(`Ошибка 429 при обновлении, ждем ${retryAfter} секунд`);
      }
      throw err;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        fetchingRef.current = false;
      }
    }
  }, [loading]);

  // Вход в систему
  const login = async (userData: any): Promise<boolean> => {
    setError(null);
    try {
      setLoading(true);
      const response = await authAPI.login(userData);

      localStorage.setItem('token', response.data.access);
      if (response.data.refresh) localStorage.setItem('refreshToken', response.data.refresh);

      await fetchCurrentUser();
      return true;
    } catch (err: any) {
      console.error('Ошибка входа:', err);
      setError(
        err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.join(', ') ||
        'Ошибка входа. Проверьте учетные данные.'
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Регистрация
  const register = async (userData: any): Promise<void> => {
    setError(null);
    try {
      setLoading(true);
      await authAPI.register(userData);
    } catch (err: any) {
      console.error('Ошибка регистрации:', err);
      let errorMessage = 'Ошибка регистрации. Попробуйте снова.';
      if (err.response?.data) {
        errorMessage = typeof err.response.data === 'string'
          ? err.response.data
          : Object.entries(err.response.data)
              .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
              .join('; ') || errorMessage;
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Вход через Google
  const loginWithGoogle = async (userInfo: GoogleUserInfo) => {
    setLoading(true);
    try {
      const response = await authAPI.googleAuth(userInfo.email, 'client');
      if (response.data?.access) {
        localStorage.setItem('token', response.data.access);
        if (response.data.refresh) localStorage.setItem('refreshToken', response.data.refresh);
        if (response.data.user) {
          localStorage.setItem('googleUser', JSON.stringify({ ...response.data.user, picture: userInfo.picture }));
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchCurrentUser();
      } else {
        throw new Error('Сервер не вернул токен');
      }
    } catch (error) {
      console.error('Ошибка Google-аутентификации:', error);
      const userData: User = {
        id: `google-${Date.now()}`,
        username: userInfo.email.split('@')[0],
        email: userInfo.email,
        first_name: userInfo.given_name || userInfo.name.split(' ')[0] || '',
        last_name: userInfo.family_name || (userInfo.name.split(' ').length > 1 ? userInfo.name.split(' ').slice(1).join(' ') : '') || '',
        profile: { user_type: 'client', phone: '', offers_home_service: false },
        favorites: [],
        picture: userInfo.picture,
        isGoogleUser: true,
      };
      const tempToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('token', tempToken);
      localStorage.setItem('googleUser', JSON.stringify(userData));
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  // Выход из системы
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('googleUser');
    setUser(null);
  };

  // Переключение избранного
  const toggleFavorite = async (haircutId: string): Promise<void> => {
    if (loading || fetchingRef.current) {
      console.log('Ждем завершения предыдущего запроса...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!haircutId) {
      console.error('haircutId не определен в toggleFavorite');
      throw new Error('ID услуги не определен');
    }

    if (!user) {
      throw new Error('Необходимо войти в систему');
    }

    try {
      const isFavorite = user.favorites?.includes(haircutId) || false;
      console.log(`Переключение избранного для ${haircutId}, текущее состояние: ${isFavorite}`);

      // Оптимистичное обновление UI
      setUser(prevUser => {
        if (!prevUser) return null;
        const newFavorites = isFavorite
          ? prevUser.favorites.filter(id => id !== haircutId)
          : [...(prevUser.favorites || []), haircutId];
        return { ...prevUser, favorites: newFavorites };
      });

      // Задержка для предотвращения частых запросов
      await new Promise(resolve => setTimeout(resolve, 500));

      // Запрос к API
      if (isFavorite) {
        console.log('Удаляем из избранного');
        await favoritesAPI.toggle(haircutId);
      } else {
        console.log('Добавляем в избранное');
        await favoritesAPI.toggle(haircutId);
      }
    } catch (err: any) {
      console.error('Ошибка переключения избранного:', err);

      // Откат состояния при ошибке
      setUser(prevUser => {
        if (!prevUser) return null;
        const isFavorite = prevUser.favorites?.includes(haircutId) || false;
        const newFavorites = isFavorite
          ? [...(prevUser.favorites || []), haircutId]
          : prevUser.favorites.filter(id => id !== haircutId);
        return { ...prevUser, favorites: newFavorites };
      });

      if (err?.response?.status === 429 || err?.isRateLimited) {
        const retryAfter = err.retryAfter || err.response?.headers?.['retry-after'] || 60;
        console.log(`Ошибка 429, ждем ${retryAfter} секунд`);
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
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};