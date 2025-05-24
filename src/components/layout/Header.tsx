// src/components/layout/Header.tsx - улучшенная версия
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, Globe, MapPin, LogOut, Search } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  // Закрыть меню при смене страницы
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

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

  // Обработчик клика на мобильной кнопке меню
  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Обработчик для открытия модального окна входа
  const handleLoginClick = () => {
    setLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  // Обработчик поиска
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/gallery?search=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
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
                    <User className="h-5 w-5 mr-1.5" />
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

          {/* Мобильная кнопка меню */}
          <button
            className="md:hidden p-2 rounded-full transition-colors"
            onClick={handleMenuClick}
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${isTransparent && !isScrolled ? 'text-white' : 'text-gray-900'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isTransparent && !isScrolled ? 'text-white' : 'text-gray-900'}`} />
            )}
          </button>
        </div>

        {/* Мобильное меню с анимацией */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white absolute left-0 right-0 top-16 shadow-lg rounded-b-lg z-40 overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Поиск в мобильном меню */}
                <form onSubmit={handleSearch} className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Найти стрижку..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="mt-2"
                  >
                    Поиск
                  </Button>
                </form>

                {/* Навигационные ссылки */}
                <div className="space-y-2">
                  <Link
                    to="/"
                    className={`block py-2 px-3 text-lg font-medium rounded-lg ${location.pathname === '/' ? 'bg-gray-100 text-[#9A0F34]' : 'text-gray-800 hover:bg-gray-50'}`}
                  >
                    {t('home')}
                  </Link>
                  <Link
                    to="/gallery"
                    className={`block py-2 px-3 text-lg font-medium rounded-lg ${location.pathname === '/gallery' ? 'bg-gray-100 text-[#9A0F34]' : 'text-gray-800 hover:bg-gray-50'}`}
                  >
                    {t('gallery')}
                  </Link>
                  <Link
                    to="/barbers"
                    className={`block py-2 px-3 text-lg font-medium rounded-lg ${location.pathname.includes('/barber') ? 'bg-gray-100 text-[#9A0F34]' : 'text-gray-800 hover:bg-gray-50'}`}
                  >
                    {t('barbers')}
                  </Link>
                </div>

                {/* Регион и Язык в мобильном меню */}
                <div className="border-t border-gray-200 pt-4 pb-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                      className="flex items-center text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 w-full"
                    >
                      <MapPin className="h-5 w-5 mr-2 text-[#9A0F34]" />
                      <span>{currentRegion.name}</span>
                      <svg
                        className={`h-4 w-4 ml-auto transition-transform ${isRegionDropdownOpen ? 'rotate-180' : ''}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Выпадающий список регионов */}
                  <AnimatePresence>
                    {isRegionDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 rounded-lg mt-1 overflow-hidden"
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Переключатель языка */}
                  <button
                    onClick={toggleLanguage}
                    className="mt-2 flex items-center text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 w-full"
                  >
                    <Globe className="h-5 w-5 mr-2 text-[#9A0F34]" />
                    <span>{language === 'ru' ? 'Русский язык' : 'Кыргыз тили'}</span>
                    <span className="ml-auto px-2 py-1 bg-gray-200 rounded text-xs font-medium">
                      {language === 'ru' ? 'RU' : 'KG'}
                    </span>
                  </button>
                </div>

                {/* Кнопки авторизации в мобильном меню */}
                <div className="border-t border-gray-200 pt-4">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <Link to="/profile">
                        <Button
                          variant="primary"
                          fullWidth
                          className="py-3"
                        >
                          <User className="h-5 w-5 mr-2" />
                          {t('profile')}
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        fullWidth
                        className="py-3"
                        onClick={() => {
                          logout();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        {t('logout')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      className="py-3"
                      onClick={handleLoginClick}
                    >
                      {t('signIn')}
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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