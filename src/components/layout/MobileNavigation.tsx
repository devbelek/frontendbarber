import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, User, Plus, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileNavigation = ({ openLoginModal }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isBarber = user?.profile?.user_type === 'barber';
  const isActive = (path) => location.pathname === path;

  const handleFavoritesClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      navigate('/profile?tab=favorites');
    }
  };

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      navigate('/profile');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Главная */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
            isActive('/') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-1">Главная</span>
        </Link>

        {/* Барберы и Барбершопы */}
        <Link
          to="/discover"
          className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
            isActive('/discover') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-[10px] mt-1">Найти</span>
        </Link>

        {/* Центральная кнопка */}
        {isBarber ? (
          <Link
            to="/add-service"
            className="relative flex items-center justify-center w-16 h-16"
          >
            <div className="absolute flex items-center justify-center w-14 h-14 rounded-full bg-[#9A0F34] text-white shadow-lg transform hover:scale-105 transition-transform">
              <Plus className="h-7 w-7" />
            </div>
          </Link>
        ) : (
          <div className="w-16 h-16" />
        )}

        {/* Избранное */}
        <button
          onClick={handleFavoritesClick}
          className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
            location.pathname === '/profile' && location.search.includes('favorites')
              ? 'text-[#9A0F34]'
              : 'text-gray-500'
          }`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-[10px] mt-1">Избранное</span>
        </button>

        {/* Профиль */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
            isActive('/profile') && !location.search.includes('favorites')
              ? 'text-[#9A0F34]'
              : 'text-gray-500'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] mt-1">Профиль</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation;