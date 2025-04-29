import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, Search, User, Scissors, LogIn } from 'lucide-react';

interface MobileNavigationProps {
  openLoginModal: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ openLoginModal }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe md:hidden">
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

        <Link
          to="/gallery"
          className={`flex flex-col items-center justify-center flex-1 ${
            isActive('/gallery') ? 'text-[#9A0F34]' : 'text-gray-500'
          }`}
        >
          <Search className="h-6 w-6" />
          <span className="text-xs mt-1">Поиск</span>
        </Link>

        <button
          onClick={openLoginModal}
          className="flex flex-col items-center justify-center flex-1 text-gray-500"
        >
          <LogIn className="h-6 w-6" />
          <span className="text-xs mt-1">Войти</span>
        </button>
        
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
          to="/profile"
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