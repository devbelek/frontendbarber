// src/components/layout/HeaderNew.tsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Globe, MapPin, LogOut } from 'lucide-react';
import { Button } from '../../ui';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useLocation as useLocationContext } from '../../context/LocationContext';

interface HeaderProps {
  openLoginModal: () => void;
}

const HeaderNew: React.FC<HeaderProps> = ({ openLoginModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { currentRegion, regions } = useLocationContext();
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  // Переключение языка
  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'kg' : 'ru');
  };

  // Определяем, находимся ли мы на главной странице
  const isHomePage = location.pathname === '/';

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

  // Динамические стили для прозрачного/непрозрачного заголовка
  const headerStyles = isHomePage && !isScrolled
    ? 'absolute top-0 left-0 right-0 bg-transparent text-white z-50 py-4'
    : 'sticky top-0 bg-white text-gray-900 shadow-sm z-50 py-3 backdrop-blur-md bg-white/90';

  const linkStyles = {
    default: isHomePage && !isScrolled
      ? 'text-white/70 hover:text-white'
      : 'text-gray-600 hover:text-gray-900',
    active: isHomePage && !isScrolled
      ? 'text-white font-medium'
      : 'text-brand-600 font-medium'
  };

  return (
    <header className={`transition-all duration-300 ${headerStyles}`}>
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          {/* Логотип */}
          <Link to="/" className="flex items-center">
            <svg
              viewBox="0 0 24 24"
              className={`h-8 w-8 ${isHomePage && !isScrolled ? 'text-white' : 'text-brand-600'}`}
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
            <span className={`ml-2 text-2xl font-bold ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`}>
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
          <div className="hidden md:flex items-center space-x-4">
            {/* Селектор региона */}
            <div className="relative">
              <button
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className={`flex items-center space-x-1 rounded-md py-1 px-2 ${
                  isHomePage && !isScrolled
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
                        setIsRegionDropdownOpen(false);
                        // Используйте функцию setCurrentRegion из контекста здесь
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        currentRegion.id === region.id
                          ? 'bg-gray-100 text-brand-600'
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
                isHomePage && !isScrolled
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
                    variant={isHomePage && !isScrolled ? "outline" : "ghost"}
                    size="sm"
                    className={isHomePage && !isScrolled ? "border-white text-white" : ""}
                  >
                    <User className="h-5 w-5 mr-1.5" />
                    {t('profile')}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {t('logout')}
                </Button>
              </>
            ) : (
              <Button
                variant={isHomePage && !isScrolled ? "outline" : "primary"}
                onClick={openLoginModal}
                className={isHomePage && !isScrolled ? "border-white text-white hover:bg-white/20" : ""}
              >
                {t('becomeBarber')}
              </Button>
            )}
          </div>

          {/* Мобильная кнопка меню */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`} />
            )}
          </button>
        </div>

        {/* Мобильное меню */}
        {isMenuOpen && (
          <div className="md:hidden py-4 mt-4 border-t border-white/10 space-y-4">
            <Link
              to="/"
              className="block py-2 text-lg font-medium text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              to="/gallery"
              className="block py-2 text-lg font-medium text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('gallery')}
            </Link>
            <Link
              to="/barbers"
              className="block py-2 text-lg font-medium text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('barbers')}
            </Link>

            {/* Регион и Язык в мобильном меню */}
            <div className="py-2 flex items-center justify-between">
              <div className="flex items-center text-white">
                <MapPin className="h-5 w-5 mr-1" />
                <span>{currentRegion.name}</span>
              </div>
              <button
                onClick={toggleLanguage}
                className="p-2 text-white"
              >
                <span className="text-sm font-medium border border-white/30 rounded px-2 py-1">
                  {language === 'ru' ? 'RU' : 'KG'}
                </span>
              </button>
            </div>

            {isAuthenticated ? (
              <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="outline"
                    fullWidth
                    className="border-white/20 text-white"
                  >
                    <User className="h-5 w-5 mr-1.5" />
                    {t('profile')}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  fullWidth
                  className="border-white/20 text-white"
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {t('logout')}
                </Button>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  fullWidth
                  className="border-white/20 text-white"
                  onClick={() => {
                    openLoginModal();
                    setIsMenuOpen(false);
                  }}
                >
                  {t('becomeBarber')}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderNew;