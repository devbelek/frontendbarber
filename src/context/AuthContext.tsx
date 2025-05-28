import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef } from 'react';
import { User } from '../types';
import { authAPI, favoritesAPI } from '../api/services';

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  login: (userData: any) => Promise<boolean>;
  loginWithGoogle: (userInfo: any) => Promise<void>;
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
  const isMountedRef = useRef(true);
  const isInitializingRef = useRef(false);

  // Проверка токена и загрузка пользователя при монтировании
  useEffect(() => {
    isMountedRef.current = true;
    checkAuthStatus();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const checkAuthStatus = async () => {
    if (isInitializingRef.current) return;
    isInitializingRef.current = true;

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      isInitializingRef.current = false;
      return;
    }

    try {
      // Проверяем, не является ли это временным Google токеном
      if (token.startsWith('google-auth-')) {
        const googleUser = localStorage.getItem('googleUser');
        if (googleUser) {
          try {
            const userData = JSON.parse(googleUser);
            setUser(userData);
          } catch (e) {
            console.error('Failed to parse Google user data:', e);
            localStorage.removeItem('token');
            localStorage.removeItem('googleUser');
          }
        }
      } else {
        // Обычный JWT токен
        await fetchCurrentUser();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
      isInitializingRef.current = false;
    }
  };

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
            ? favoritesResponse.data.map((fav: any) => String(fav.service))
            : [];
        }
      } catch (err) {
        console.warn('Failed to fetch favorites:', err);
      }

      const userData: User = {
        id: String(response.data.id),
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name || '',
        last_name: response.data.last_name || '',
        profile: response.data.profile || {},
        favorites,
      };

      if (isMountedRef.current) {
        setUser(userData);
      }

      return userData;
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      throw err;
    }
  };

  const refreshUserData = useCallback(async () => {
    if (!isMountedRef.current || !localStorage.getItem('token')) return;

    try {
      await fetchCurrentUser();
    } catch (err) {
      console.error('Failed to refresh user data:', err);
    }
  }, []);

  const login = async (credentials: any): Promise<boolean> => {
    setError(null);
    try {
      setLoading(true);

      // Вход через API
      const response = await authAPI.login(credentials);

      // Сохраняем токены
      localStorage.setItem('token', response.data.access);
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }

      // Загружаем данные пользователя
      await fetchCurrentUser();

      return true;
    } catch (err: any) {
      console.error('Login failed:', err);
      const errorMessage = err.response?.data?.detail ||
        err.response?.data?.non_field_errors?.join(', ') ||
        'Ошибка входа. Проверьте учетные данные.';
      setError(errorMessage);
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
      let errorMessage = 'Ошибка регистрации. Попробуйте снова.';

      if (err.response?.data) {
        const errors = err.response.data;
        if (typeof errors === 'object') {
          errorMessage = Object.entries(errors)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        }
      }

      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (userInfo: any) => {
    setLoading(true);
    try {
      // Сохраняем минимальную информацию для временной работы
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

      // Временный токен для обозначения Google пользователя
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('googleUser');
    setUser(null);
    setError(null);
  };

  const toggleFavorite = async (haircutId: string): Promise<void> => {
    if (!haircutId || !user) {
      throw new Error('Invalid haircut ID or user not authenticated');
    }

    const isFavorite = user.favorites?.includes(haircutId) || false;

    // Оптимистичное обновление
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