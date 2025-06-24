import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, User, Plus, Heart } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import React from "react";

type MobileNavigationProps = {
  openLoginModal: () => void;
};

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  openLoginModal,
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

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50 safe-area-inset-bottom shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {/* Главная */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full transition-all ${
            isActive("/") ? "text-[#9A0F34]" : "text-gray-500"
          } hover:text-[#9A0F34]`}
        >
          <Home className="h-6 w-6" />
          <span className="text-[11px] mt-1 font-medium">Главная</span>
        </Link>

        {/* Найти */}
        <Link
          to="/discover"
          className={`flex flex-col items-center justify-center w-full transition-all ${
            isActive("/discover") ? "text-[#9A0F34]" : "text-gray-500"
          } hover:text-[#9A0F34]`}
        >
          <Users className="h-6 w-6" />
          <span className="text-[11px] mt-1 font-medium">Найти</span>
        </Link>

        <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
          <Link to="/add-service">
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#9A0F34] text-white shadow-lg transition-transform hover:scale-105">
              <Plus className="h-7 w-7" />
            </div>
          </Link>
        </div>

        {/* Избранное */}
        <button
          onClick={handleFavoritesClick}
          className={`flex flex-col items-center justify-center w-full transition-all ${
            location.pathname === "/profile" &&
            location.search.includes("favorites")
              ? "text-[#9A0F34]"
              : "text-gray-500"
          } hover:text-[#9A0F34]`}
        >
          <Heart className="h-6 w-6" />
          <span className="text-[11px] mt-1 font-medium">Избранное</span>
        </button>

        {/* Профиль */}
        <button
          onClick={handleProfileClick}
          className={`flex flex-col items-center justify-center w-full transition-all ${
            isActive("/profile") && !location.search.includes("favorites")
              ? "text-[#9A0F34]"
              : "text-gray-500"
          } hover:text-[#9A0F34]`}
        >
          <User className="h-6 w-6" />
          <span className="text-[11px] mt-1 font-medium">Профиль</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation;
