import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';
import { authAPI, favoritesAPI } from '../api/services';

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

  // Рефы для управления запросами
  const isMountedRef = useRef(true);
  const isInitializedRef = useRef(false);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    isMountedRef.current = true;

    const initAuth = async () => {
      // Предотвращаем повторную инициализацию
      if (isInitializedRef.current) return;
      isInitializedRef.current = true;

      const token = localStorage.getItem('token');
      const googleUser = localStorage.getItem('googleUser');

      if (token) {
        try {
          await fetchCurrentUser();
        } catch (err) {
          console.error('Failed to fetch user:', err);
          // Если это Google пользователь, используем сохраненные данные
          if (googleUser) {
            try {
              const userData = JSON.parse(googleUser);
              setUser(userData);
            } catch (e) {
              console.error('Failed to parse Google user data:', e);
            }
          }
        }
      }

      setLoading(false);
    };

    initAuth();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Получение текущего пользователя
  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();

      if (!response?.data) {
        throw new Error('No user data received');
      }

      // Получаем избранное
      let favorites: string[] = [];
      try {
        const favoritesResponse = await favoritesAPI.getAll();
        if (favoritesResponse?.data) {
          favorites = Array.isArray(favoritesResponse.data)
            ? favoritesResponse.data.map((fav: any) => fav.service)
            : [];
        }
      } catch (err) {
        console.warn('Failed to fetch favorites:', err);
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

      if (isMountedRef.current) {
        setUser(userData);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      throw err;
    }
  };

  // Обновление данных пользователя - с дебаунсом
  const refreshUserData = useCallback(async () => {
    if (!isMountedRef.current || !user) return;

    try {
      await fetchCurrentUser();
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }, [user]);

  // Вход в систему
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
      console.error('Registration failed:', err);
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
      // Временное решение для Google auth
      const userData: User = {
        id: `google-${Date.now()}`,
        username: userInfo.email.split('@')[0],
        email: userInfo.email,
        first_name: userInfo.given_name || userInfo.name.split(' ')[0] || '',
        last_name: userInfo.family_name || '',
        profile: {
          user_type: 'client',
          phone: '',
          offers_home_service: false
        },
        favorites: [],
        picture: userInfo.picture,
        isGoogleUser: true,
      };

      // Сохраняем временный токен
      const tempToken = `google-auth-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('token', tempToken);
      localStorage.setItem('googleUser', JSON.stringify(userData));

      setUser(userData);
    } catch (error) {
      console.error('Google auth error:', error);
      setError('Ошибка входа через Google');
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
    isInitializedRef.current = false;
  };

  // Переключение избранного - оптимизировано
  const toggleFavorite = async (haircutId: string): Promise<void> => {
    if (!haircutId || !user) {
      throw new Error('Invalid haircut ID or user not authenticated');
    }

    const isFavorite = user.favorites?.includes(haircutId) || false;

    // Оптимистичное обновление UI
    setUser(prevUser => {
      if (!prevUser) return null;

      const newFavorites = isFavorite
        ? prevUser.favorites.filter(id => id !== haircutId)
        : [...(prevUser.favorites || []), haircutId];

      return { ...prevUser, favorites: newFavorites };
    });

    try {
      await favoritesAPI.toggle(haircutId);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);

      // Откат изменений при ошибке
      setUser(prevUser => {
        if (!prevUser) return null;

        const newFavorites = isFavorite
          ? [...(prevUser.favorites || []), haircutId]
          : prevUser.favorites.filter(id => id !== haircutId);

        return { ...prevUser, favorites: newFavorites };
      });

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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};