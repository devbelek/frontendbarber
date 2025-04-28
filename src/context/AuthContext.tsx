import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User } from '../types';

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  logout: () => void;
  toggleFavorite: (haircutId: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const toggleFavorite = (haircutId: string) => {
    if (!user) return;

    setUser(prevUser => {
      if (!prevUser) return null;

      const isFavorite = prevUser.favorites.includes(haircutId);
      const updatedFavorites = isFavorite
        ? prevUser.favorites.filter(id => id !== haircutId)
        : [...prevUser.favorites, haircutId];

      return {
        ...prevUser,
        favorites: updatedFavorites
      };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        toggleFavorite
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