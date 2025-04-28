import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { authAPI } from '../api/services';
import { favoritesAPI } from '../api/services';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: any) => void;
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
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getCurrentUser();

      // Получаем избранные услуги
      const favoritesResponse = await favoritesAPI.getAll();

      // Преобразуем данные пользователя
      const userData: User = {
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        profile: response.data.profile,
        favorites: favoritesResponse.data.map((favorite: any) => favorite.service)
      };

      setUser(userData);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: any) => {
    setUser(userData);
  };

  const register = async (userData: any) => {
    setError(null);
    try {
      setLoading(true);
      await authAPI.register(userData);
      // После успешной регистрации, мы не выполняем вход автоматически,
      // так как это может потребовать подтверждения через email в реальном приложении
      return Promise.resolve();
    } catch (err: any) {
      console.error('Registration failed:', err);
      const errorMessages = Object.values(err.response?.data || {}).flat();
      setError(errorMessages.join(', ') || 'Ошибка регистрации');
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const toggleFavorite = async (haircutId: string) => {
    if (!user) return Promise.reject('User not authenticated');

    try {
      const isFavorite = user.favorites.includes(haircutId);

      if (isFavorite) {
        await favoritesAPI.remove(haircutId);
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            favorites: prev.favorites.filter(id => id !== haircutId)
          };
        });
      } else {
        await favoritesAPI.add(haircutId);
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            favorites: [...prev.favorites, haircutId]
          };
        });
      }

      return Promise.resolve();
    } catch (err) {
      console.error('Error toggling favorite:', err);
      return Promise.reject(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
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