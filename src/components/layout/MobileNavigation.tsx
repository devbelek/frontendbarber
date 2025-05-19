// src/components/layout/MobileNavigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Scissors, Plus, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileNavigation = ({ openLoginModal }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Определяем, является ли пользователь барбером
  const isBarber = user?.profile?.user_type === 'barber';

  const isActive = (path) => location.pathname === path;

  const handleProfileClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openLoginModal();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Главная */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full ${
            isActive('/') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Главная</span>
        </Link>

        {/* Поиск/Галерея */}
        <Link
          to="/gallery"
          className={`flex flex-col items-center justify-center w-full ${
            isActive('/gallery') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Поиск</span>
        </Link>

        {/* Центральная кнопка: + для барберов или избранное для обычных пользователей */}
        {isBarber ? (
          <Link
            to="/add-service"
            className="relative flex flex-col items-center justify-center w-full"
          >
            <div className="absolute -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-[#9A0F34] text-white shadow-lg">
              <Plus className="h-8 w-8" />
            </div>
            <div className="h-6"></div>
            <span className="text-xs mt-5 text-gray-500">Добавить</span>
          </Link>
        ) : (
          <Link
            to={isAuthenticated ? "/profile?tab=favorites" : "#"}
            onClick={e => isAuthenticated ? null : handleProfileClick(e)}
            className="relative flex flex-col items-center justify-center w-full"
          >
            <div className="absolute -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-[#9A0F34] text-white shadow-lg">
              <Heart className="h-8 w-8" />
            </div>
            <div className="h-6"></div>
            <span className="text-xs mt-5 text-gray-500">Избранное</span>
          </Link>
        )}

        {/* Барберы */}
        <Link
          to="/barbers"
          className={`flex flex-col items-center justify-center w-full ${
            isActive('/barbers') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Scissors className="h-6 w-6" />
          <span className="text-xs mt-1">Барберы</span>
        </Link>

        {/* Профиль */}
        <Link
          to={isAuthenticated ? "/profile" : "#"}
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center w-full ${
            isActive('/profile') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <User className="h-6 w-6" />
          <span className="text-xs mt-1">Профиль</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;