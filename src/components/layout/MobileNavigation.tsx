import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Search, User, Scissors } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import { Plus } from "lucide-react";

interface MobileNavigationProps {
  openLoginModal: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ openLoginModal }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openLoginModal();
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:hidden z-40">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center flex-1 ${
            isActive('/') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Home className="h-6 w-6" />
          <span className="text-xs mt-1">Главная</span>
        </Link>
            {/* Центральная кнопка + */}
    <div className="relative">
      <Link to="/add-service" className="absolute -top-5 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg">
          <Plus className="h-8 w-8" />
        </div>
      </Link>
    </div>

        <Link
          to="/gallery"
          className={`flex flex-col items-center justify-center flex-1 ${
            isActive('/gallery') ? 'text-[#00000]' : 'text-gray-500'
          }`}
        >
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Поиск</span>
        </Link>

        <Link
          to="/barbers"
          className={`flex flex-col items-center justify-center flex-1 ${
            isActive('/barbers') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Scissors className="h-6 w-6" />
          <span className="text-xs mt-1">Барберы</span>
        </Link>

        <Link
          to={isAuthenticated ? "/profile" : "#"}
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center flex-1 ${
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