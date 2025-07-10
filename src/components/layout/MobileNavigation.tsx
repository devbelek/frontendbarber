import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, User, Plus, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import React from "react";

type MobileNavigationProps = {
  openLoginModal: () => void;
  isModalOpen?: boolean; // New prop to handle modal visibility
};

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  openLoginModal,
  isModalOpen = false,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isBarber = user?.profile?.user_type === "barber";

  const isActive = (path: string) => location.pathname === path;

  const handleFavoritesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      navigate("/profile?tab=favorites");
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openLoginModal();
    } else {
      navigate("/profile");
    }
  };

  if (isModalOpen) return null; // Hide navigation when modal is open

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40 safe-area-inset-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
      role="navigation"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16 px-2 sm:px-4">
        {/* Главная */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full transition-all duration-200 ${
            isActive("/") ? "text-[#9A0F34]" : "text-gray-500"
          } hover:text-[#9A0F34] focus:outline-none focus:ring-2 focus:ring-[#9A0F34]/50`}
          aria-current={isActive("/") ? "page" : undefined}
          aria-label="Главная страница"
        >
          <Home className="h-6 w-6" />
          <span className="text-[11px] sm:text-xs mt-1 font-medium">
            Главная
          </span>
        </Link>

        {/* Найти */}
        <Link
          to="/discover"
          className={`flex flex-col items-center justify-center w-full transition-all duration-200 ${
            isActive("/discover") ? "text-[#9A0F34]" : "text-gray-500"
          } hover:text-[#9A0F34] focus:outline-none focus:ring-2 focus:ring-[#9A0F34]/50`}
          aria-current={isActive("/discover") ? "page" : undefined}
          aria-label="Найти услуги"
        >
          <Users className="h-6 w-6" />
          <span className="text-[11px] sm:text-xs mt-1 font-medium">Найти</span>
        </Link>

        {/* Add Service Button */}
        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
          <Link
            to="/add-service"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-[#9A0F34] text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#9A0F34]/50"
            aria-label="Добавить услугу"
          >
            <Plus className="h-7 w-7" />
          </Link>
        </div>

        {/* Избранное */}
        <button
          onClick={handleFavoritesClick}
          className={`flex flex-col items-center justify-center w-full transition-all duration-200 ${
            location.pathname === "/profile" &&
            location.search.includes("favorites")
              ? "text-[#9A0F34]"
              : "text-gray-500"
          } hover:text-[#9A0F34] focus:outline-none focus:ring-2 focus:ring-[#9A0F34]/50`}
          aria-label="Избранное"
        >
          <Heart className="h-6 w-6" />
          <span className="text-[11px] sm:text-xs mt-1 font-medium">
            Избранное
          </span>
        </button>

        {/* Профиль */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center w-full transition-all duration-200 ${
            isActive("/profile") && !location.search.includes("favorites")
              ? "text-[#9A0F34]"
              : "text-gray-500"
          } hover:text-[#9A0F34] focus:outline-none focus:ring-2 focus:ring-[#9A0F34]/50`}
          aria-label="Профиль"
        >
          <User className="h-6 w-6" />
          <span className="text-[11px] sm:text-xs mt-1 font-medium">
            Профиль
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation;
