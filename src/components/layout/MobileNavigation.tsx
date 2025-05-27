import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, User, Scissors, Plus, Heart, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileNavigation = ({ openLoginModal }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isBarber = user?.profile?.user_type === 'barber';
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Главная */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full py-2 ${
            isActive('/') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-[10px] mt-1">Главная</span>
        </Link>

        {/* Барбершопы */}
        <Link
          to="/barbershops"
          className={`flex flex-col items-center justify-center w-full py-2 ${
            isActive('/barbershops') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Store className="h-5 w-5" />
          <span className="text-[10px] mt-1">Барбершопы</span>
        </Link>

        {/* Центральная кнопка */}
        {isBarber ? (
          <Link
            to="/add-service"
            className="relative flex items-center justify-center w-16 h-16"
          >
            <div className="absolute flex items-center justify-center w-14 h-14 rounded-full bg-[#9A0F34] text-white shadow-lg">
              <Plus className="h-7 w-7" />
            </div>
          </Link>
        ) : (
          <Link
            to="/barbers"
            className="relative flex items-center justify-center w-16 h-16"
          >
            <div className="absolute flex items-center justify-center w-14 h-14 rounded-full bg-[#9A0F34] text-white shadow-lg">
              <Scissors className="h-7 w-7" />
            </div>
          </Link>
        )}

        {/* Избранное */}
        <Link
          to={isAuthenticated ? "/profile?tab=favorites" : "#"}
          onClick={e => !isAuthenticated && (e.preventDefault(), openLoginModal())}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            location.search.includes('favorites') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-[10px] mt-1">Избранное</span>
        </Link>

        {/* Профиль */}
        <Link
          to={isAuthenticated ? "/profile" : "#"}
          onClick={e => !isAuthenticated && (e.preventDefault(), openLoginModal())}
          className={`flex flex-col items-center justify-center w-full py-2 ${
            isActive('/profile') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] mt-1">Профиль</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;