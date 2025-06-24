import { FC, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, MapPin, LogOut, Store, Home } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation as useLocationContext } from "../../context/LocationContext";

interface HeaderProps {
  openLoginModal: () => void; // Добавляем проп для открытия модального окна
}

const Header: FC<HeaderProps> = ({ openLoginModal }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { currentRegion } = useLocationContext();
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "ru" ? "kg" : "ru");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 bg-white text-gray-900 shadow-sm z-50 py-2 backdrop-blur-md bg-white/95">
      <div className="container mx-auto px-4 relative">
        <div className="flex justify-between items-center h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7 text-[#9A0F34]"
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
            <span className="ml-2 text-xl font-bold text-gray-900">TARAK</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center border-b-2 transition-all duration-200 pb-1 ${
                location.pathname === "/"
                  ? "border-[#9A0F34] text-[#9A0F34] font-semibold"
                  : "border-transparent text-gray-700 hover:text-[#9A0F34] hover:border-[#9A0F34]"
              }`}
            >
              <Home className="h-5 w-5 mr-2" />
              Главная
            </Link>
            <Link
              to="/discover"
              className={`flex items-center border-b-2 transition-all duration-200 pb-1 ${
                location.pathname === "/discover"
                  ? "border-[#9A0F34] text-[#9A0F34] font-semibold"
                  : "border-transparent text-gray-700 hover:text-[#9A0F34] hover:border-[#9A0F34]"
              }`}
            >
              <Store className="h-5 w-5 mr-2" />
              Мастера и салоны
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Region Selector */}
            <div className="relative">
              <button
                onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                className="flex items-center space-x-1 rounded-md py-1 px-2 text-gray-700 hover:bg-gray-100"
              >
                <MapPin className="h-4 w-4" />
                <span className="text-sm">{currentRegion.name}</span>
                <svg
                  className={`h-4 w-4 transition-transform ${
                    isRegionDropdownOpen ? "rotate-180" : ""
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
              aria-label="Сменить язык"
            >
              <Globe className="h-5 w-5" />
            </button>

            {/* Authentication Buttons */}
            {isAuthenticated ? (
              <>
                <Link to="/profile">
                  <Button variant="ghost" size="sm">
                    {t("profile")}
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="h-4 w-4 mr-1.5" />
                  {t("logout")}
                </Button>
              </>
            ) : (
              <Button variant="primary" onClick={openLoginModal}>
                {t("signIn")}
              </Button>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleLanguage}
              className="flex items-center px-3 py-1.5 rounded-lg bg-[#9A0F34] text-white text-sm font-medium shadow"
              aria-label="Сменить язык"
            >
              <Globe className="h-4 w-4" />
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
              aria-label="Toggle mobile menu"
            ></button>
          </div>
        </div>

        {/* Mobile Menu */}
        {/* {isMobileMenuOpen && (
          <div className="md:hidden absolute top-14 right-0 w-64 bg-white border border-gray-200 shadow-lg z-50">
            <nav className="flex flex-col space-y-4 p-4">
              <Link
                to="/"
                onClick={toggleMobileMenu}
                className={`flex items-center text-gray-700 hover:text-[#9A0F34] ${
                  location.pathname === "/"
                    ? "text-[#9A0F34] font-semibold"
                    : ""
                }`}
              >
                <Home className="h-5 w-5 mr-2" />
                Главная
              </Link>
              <Link
                to="/discover"
                onClick={toggleMobileMenu}
                className={`flex items-center text-gray-700 hover:text-[#9A0F34] ${
                  location.pathname === "/discover"
                    ? "text-[#9A0F34] font-semibold"
                    : ""
                }`}
              >
                <Store className="h-5 w-5 mr-2" />
                Мастера и салоны
              </Link>
              <div className="flex flex-col space-y-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsRegionDropdownOpen(!isRegionDropdownOpen);
                  }}
                  className="flex items-center text-gray-700 hover:text-[#9A0F34]"
                >
                  <MapPin className="h-5 w-5 mr-2" />
                  {currentRegion.name}
                </button>

                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={toggleMobileMenu}
                      className="flex items-center text-gray-700 hover:text-[#9A0F34]"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-left"
                      >
                        {t("profile")}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        logout();
                        toggleMobileMenu();
                      }}
                      className="w-full text-left"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      {t("logout")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      openLoginModal();
                      toggleMobileMenu();
                    }}
                    className="w-full text-left"
                  >
                    {t("signIn")}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )} */}
      </div>
    </header>
  );
};

export default Header;
