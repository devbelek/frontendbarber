// src/components/layout/Header.tsx

import { FC, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Globe, MapPin, LogOut, Scissors, Store } from "lucide-react";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useLocation as useLocationContext } from "../../context/LocationContext";
import UnifiedLoginModal from "../ui/UnifiedLoginModal";

const Header: FC = () => {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { currentRegion, regions, setCurrentRegion } = useLocationContext();
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === "ru" ? "kg" : "ru");
  };

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  return (
    <header className="sticky top-0 bg-white text-gray-900 shadow-sm z-50 py-2 backdrop-blur-md bg-white/95">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          {/* Логотип */}
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

          {/* Навигация */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/barbers"
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === "/barbers"
                  ? "bg-[#9A0F34] text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Scissors className="h-5 w-5 mr-2" />
              Барберы
            </Link>

            <Link
              to="/barbershops"
              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                location.pathname === "/barbershops"
                  ? "bg-[#9A0F34] text-white shadow-lg"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Store className="h-5 w-5 mr-2" />
              Барбершопы
            </Link>
          </nav>

          {/* Кнопки региона, языка, авторизации */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Селектор региона */}
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
                          ? "bg-gray-100 text-[#9A0F34]"
                          : "text-gray-700 hover:bg-gray-50"
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
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100"
              aria-label="Сменить язык"
            >
              <Globe className="h-5 w-5" />
            </button>

            {/* Кнопки авторизации */}
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
              <Button variant="primary" onClick={handleLoginClick}>
                {t("signIn")}
              </Button>
            )}
          </div>

          {/* Мобильная кнопка */}
          <div className="md:hidden">
            <Link
              to="/barbers"
              className="flex items-center px-3 py-1.5 rounded-lg bg-[#9A0F34] text-white text-sm font-medium shadow"
            >
              <Scissors className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Рендерим модалку через портал */}
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
