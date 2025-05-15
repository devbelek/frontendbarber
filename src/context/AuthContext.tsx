// src/context/AuthContext.tsx
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

  // Используем ref для отслеживания активных запросов
  const fetchingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastFetchTime = useRef<number>(0);
  const MIN_FETCH_INTERVAL = 5000; // Минимальный интервал между запросами (5 секунд)

  // Проверяем аутентификацию при загрузке
  useEffect(() => {
    mountedRef.current = true;

    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const googleUser = localStorage.getItem('googleUser');

      // Проверяем минимальный интервал между запросами
      const now = Date.now();
      if (now - lastFetchTime.current < MIN_FETCH_INTERVAL) {
        console.log('Слишком частые запросы, пропускаем');
        setLoading(false);
        return;
      }

      if (token && !fetchingRef.current) {
        try {
          await fetchCurrentUser();
        } catch (err: any) {
          console.error('Error fetching user:', err);

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
      console.log('Слишком частые запросы к fetchCurrentUser, пропускаем');
      return;
    }

    try {
      fetchingRef.current = true;
      lastFetchTime.current = now;
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
      console.log('Слишком частое обновление данных пользователя, пропускаем');
      return;
    }

    try {
      fetchingRef.current = true;
      lastFetchTime.current = now;
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
        localStorage.setItem('refresh', response.data.refresh);
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

  const loginWithGoogle = async (googleUserInfo: GoogleUserInfo) => {
    try {
      setLoading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

      try {
        const response = await axios.post(`${API_URL}/users/register-google/`, {
          email: googleUserInfo.email,
          first_name: googleUserInfo.given_name || googleUserInfo.name.split(' ')[0],
          last_name: googleUserInfo.family_name || googleUserInfo.name.split(' ').slice(1).join(' '),
          picture: googleUserInfo.picture
        });

        console.log('Регистрация через Google успешна:', response.data);

        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          if (response.data.refresh_token) {
            localStorage.setItem('refreshToken', response.data.refresh_token);
          }
        }

        const userData: User = {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          first_name: response.data.first_name,
          last_name: response.data.last_name,
          profile: response.data.profile,
          favorites: [],
          picture: googleUserInfo.picture
        };

        localStorage.setItem('googleUser', JSON.stringify(userData));

        if (mountedRef.current) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Ошибка аутентификации через сервер:', error);

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

        const tempToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        localStorage.setItem('token', tempToken);
        localStorage.setItem('googleUser', JSON.stringify(userData));

        if (mountedRef.current) {
          setUser(userData);
        }
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
    if (loading || fetchingRef.current) return;

    try {
      if (!user) {
        throw new Error('Необходимо войти в систему для добавления в избранное');
      }

      const isFavorite = user.favorites?.includes(haircutId) || false;

      if (isFavorite) {
        await favoritesAPI.remove(haircutId);
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            favorites: prevUser.favorites.filter(id => id !== haircutId)
          };
        });
      } else {
        await favoritesAPI.add(haircutId);
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