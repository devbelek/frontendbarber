import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Globe, MessageSquare, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import Logo from '../ui/Logo';
import RegionSelector from '../ui/RegionSelector';
import { Language } from '../../types';
import { motion } from 'framer-motion';

interface HeaderProps {
  openLoginModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openLoginModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'ru' ? 'kg' : 'ru';
    setLanguage(newLanguage);
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

  // Определяем, находимся ли мы на главной странице
  const isHomePage = location.pathname === '/';

  // Стили для прозрачного и непрозрачного заголовка
  const headerStyles = isHomePage && !isScrolled
    ? 'bg-transparent text-white absolute top-0 left-0 right-0 z-50 transition-all duration-300'
    : 'bg-white text-gray-900 shadow-sm sticky top-0 z-50 transition-all duration-300';

  // Логотип и анимации
  const logoVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const navVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <header className={headerStyles}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={logoVariants}
          >
            <Link to="/">
              <Logo darkMode={isHomePage && !isScrolled} size="md" />
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav
            className="hidden md:flex items-center space-x-8"
            initial="hidden"
            animate="visible"
            variants={navVariants}
          >
            <motion.div variants={itemVariants}>
              <Link
                to="/"
                className={`font-medium hover:text-[#9A0F34] transition-colors ${
                  location.pathname === '/'
                    ? (isHomePage && !isScrolled ? 'text-white' : 'text-[#9A0F34]')
                    : (isHomePage && !isScrolled ? 'text-gray-200' : 'text-gray-700')
                }`}
              >
                {t('home')}
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                to="/gallery"
className={`bg-white text-[#9A0F34] border border-[#9A0F34] font-medium px-4 py-2 rounded-md hover:bg-gray-100 transition-colors`}
              >
                {t('gallery')}
              </Link>
            </motion.div>
            <motion.div variants={itemVariants}>
              <Link
                to="/barbers"
                className={`font-medium hover:text-[#9A0F34] transition-colors ${
                  location.pathname.includes('/barber')
                    ? (isHomePage && !isScrolled ? 'text-white' : 'text-[#9A0F34]')
                    : (isHomePage && !isScrolled ? 'text-gray-200' : 'text-gray-700')
                }`}
              >
                {t('barbers')}
              </Link>
            </motion.div>
          </motion.nav>

          {/* Desktop Auth & Settings */}
          <motion.div
            className="hidden md:flex items-center space-x-3"
            initial="hidden"
            animate="visible"
            variants={navVariants}
          >
            {/* Region Selector */}
            <motion.div variants={itemVariants}>
              <RegionSelector />
            </motion.div>

            <motion.button
              variants={itemVariants}
              onClick={toggleLanguage}
              className={`p-2 rounded-full transition-colors ${
                isHomePage && !isScrolled
                  ? 'hover:bg-white/20'
                  : 'hover:bg-gray-100'
              }`}
              aria-label="Switch Language"
            >
              <Globe className={`h-5 w-5 ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-700'}`} />
            </motion.button>

            {isAuthenticated ? (
              <>
                <motion.div variants={itemVariants}>
                  <Link to="/profile">
                    <Button
                      variant={isHomePage && !isScrolled ? "outline" : "ghost"}
                      size="sm"
                      className={isHomePage && !isScrolled ? "border-white text-white hover:bg-white/20" : ""}
                    >
                      <User className="h-5 w-5 mr-1" />
                      Мой профиль
                    </Button>
                  </Link>
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button
                    variant={isHomePage && !isScrolled ? "outline" : "outline"}
                    size="sm"
                    onClick={logout}
                    className={isHomePage && !isScrolled ? "border-white text-white hover:bg-white/20" : ""}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    {t('logout')}
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div variants={itemVariants}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={openLoginModal}
                  className={isHomePage && !isScrolled ? "bg-white text-[#9A0F34] hover:bg-gray-100" : ""}
                >
                  Я барбер
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-md transition-colors ${
              isHomePage && !isScrolled ? 'hover:bg-white/20' : 'hover:bg-gray-100'
            }`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMenuOpen ? (
              <X className={`h-6 w-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`} />
            ) : (
              <Menu className={`h-6 w-6 ${isHomePage && !isScrolled ? 'text-white' : 'text-gray-900'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t mt-3 space-y-4 bg-white text-gray-900">
            <Link
              to="/"
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              to="/gallery"
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('gallery')}
            </Link>
            <Link
              to="/barbers"
              className="block px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              {t('barbers')}
            </Link>

            <div className="pt-2 border-t flex justify-between">
              <div className="flex space-x-2">
                <RegionSelector />
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Switch Language"
                >
                  <Globe className="h-5 w-5 text-gray-700" />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="flex space-x-2">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5 mr-1" />
                      Мой профиль
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}>
                    Выйти
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="primary" size="sm" onClick={() => {
                    openLoginModal();
                    setIsMenuOpen(false);
                  }}>
                    Я барбер
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;