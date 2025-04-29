import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, Scissors, Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { Language } from '../../types';

interface HeaderProps {
  openLoginModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ openLoginModal }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, language, setLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'ru' ? 'kg' : 'ru';
    setLanguage(newLanguage);
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Scissors className="h-8 w-8 mr-2 text-[#9A0F34]" />
            <span className="text-xl font-bold">tarak</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-[#9A0F34] transition-colors">
              {t('home')}
            </Link>
            <Link to="/gallery" className="text-gray-700 hover:text-[#9A0F34] transition-colors">
              {t('gallery')}
            </Link>
            <Link to="/barbers" className="text-gray-700 hover:text-[#9A0F34] transition-colors">
              {t('barbers')}
            </Link>
          </nav>

          {/* Desktop Auth & Settings */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Switch Language"
            >
              <Globe className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    <User className="h-5 w-5 mr-1" />
                    {t('profile')}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  {t('logout')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={openLoginModal}>
                  {t('signIn')}
                </Button>
                <Button variant="primary" size="sm" onClick={openLoginModal}>
                  {t('becomeBarber')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t mt-3 space-y-4">
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
                <button
                  onClick={toggleLanguage}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Switch Language"
                >
                  <Globe className="h-5 w-5" />
                </button>
              </div>

              {isAuthenticated ? (
                <div className="flex space-x-2">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" size="sm">
                      <User className="h-5 w-5 mr-1" />
                      {t('profile')}
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}>
                    {t('logout')}
                  </Button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => {
                    openLoginModal();
                    setIsMenuOpen(false);
                  }}>
                    {t('signIn')}
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => {
                    openLoginModal();
                    setIsMenuOpen(false);
                  }}>
                    {t('becomeBarber')}
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