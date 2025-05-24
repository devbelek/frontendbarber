// src/components/layout/Header.tsx - обновленная версия без мобильного меню
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Globe, MapPin, LogOut, Search, X } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation as useLocationContext } from '../../context/LocationContext';
import UnifiedLoginModal from '../ui/UnifiedLoginModal';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  openLoginModal: () => void;
  isTransparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ openLoginModal, isTransparent = false }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { currentRegion, regions, setCurrentRegion } = useLocationContext();
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Переключение языка
  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'kg' : 'ru');
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Обработчик клика вне области выпадающего меню для закрытия
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isRegionDropdownOpen) {
        setIsRegionDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isRegionDropdownOpen]);

  // Обработчик для открытия модального окна входа
  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  // Обработчик поиска
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gallery?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Динамические стили для прозрачного/непрозрачного заголовка
  const headerStyles = isTransparent && !isScrolled
    ? 'fixed top-0 left-0 right-0 bg-transparent text-white z-50 py-2'
    : 'sticky top-0 bg-white text-gray-900 shadow-sm z-50 py-2 backdrop-blur-md bg-white/90';

  const linkStyles = {
    default: isTransparent && !isScrolled
      ? 'text-white/80 hover:text-white'
      : 'text-gray-600 hover:text-gray-900',
    active: isTransparent && !isScrolled
      ? 'text-white font-medium'
      : 'text-[#9A0F34] font-medium'
  };

  return (
    <header className={`transition-all duration-300 ${headerStyles}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Логотип */}
          <Link to="/" className="flex items-center">
            <svg
              viewBox="0 0 24 24"
              className={`h-7 w-7 ${isTransparent && !isScrolled ? 'text-white' : 'text-[#9A0F34]'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
              <path d="M8 6h8" />
              <path d="M8 10h8" />
              <path d="M8 14h8" />
              <path d="M8 18h8" />
            </svg>
            <span className={`ml-2 text-xl font-bold ${isTransparent && !isScrolled ? 'text-white' : 'text-gray-900'}`}>
              TARAK
            </span>
          </Link>

          {/* Навигация для десктопов */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`font-medium transition-colors ${location.pathname === '/' ? linkStyles.active : linkStyles.default}`}
            >
              {t('home')}
            </Link>
            <Link
              to="/gallery"
              className={`font-medium transition-colors ${location.pathname === '/gallery' ? linkStyles.active : linkStyles.default}`}
            >
              {t('gallery')}
            </Link>
            <Link
              to="/barbers"
              className={`font-medium transition-colors ${location.pathname.includes('/barber') ? linkStyles.active : linkStyles.default}`}
            >
              {t('barbers')}
            </Link>
          </nav>

          {/* Десктопные кнопки: регион, язык, авторизация */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Селектор региона */}
            <div className="relative">
              <button
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className={`flex items-center space-x-1 rounded-md py-1 px-2 ${
                  isTransparent && !isScrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{currentRegion.name}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${isRegionDropdownOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {isRegionDropdownOpen && (
                <div className="absolute right-0 mt-1 bg-white rounded-md shadow-lg py-1 z-50 min-w-[180px]">
                  {regions.map((region) => (
                    <button
                      key={region.id}
                      onClick={() => {
                        setCurrentRegion(region);
                        setIsRegionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        currentRegion.id === region.id
                          ? 'bg-gray-100 text-[#9A0F34]'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {region.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Переключатель языка */}
            <button
              onClick={toggleLanguage}
              className={`p-2 rounded-full ${
                isTransparent && !isScrolled
                  ? 'text-white hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Сменить язык"
            >
              <Globe className="h-5 w-5" />
            </button>

            {/* Кнопки авторизации */}
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button
                    variant={isTransparent && !isScrolled ? "outline" : "ghost"}
                    size="sm"
                    className={isTransparent && !isScrolled ? "border-white text-white" : ""}
                  >
                    {t('profile')}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className={isTransparent && !isScrolled ? "border-white text-white hover:bg-white/20" : ""}
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <Button
                variant={isTransparent && !isScrolled ? "outline" : "primary"}
                onClick={handleLoginClick}
                className={isTransparent && !isScrolled ? "border-white text-white hover:bg-white/20" : ""}
              >
                {t('signIn')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно входа */}
      {loginModalOpen && (
        <UnifiedLoginModal
          isOpen={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;