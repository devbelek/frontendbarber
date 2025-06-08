import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LocationProvider } from "./context/LocationContext";
import { NotificationProvider } from "./context/NotificationContext";
import HomePage from "./pages/HomePage";
import BarberProfilePage from "./pages/BarberProfilePage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginModal from "./components/auth/LoginModal";
import LoginPage from "./pages/LoginPage";
import AddServicePage from "./pages/AddServicePage";
import EditServicePage from "./pages/EditServicePage";
import DiscoverPage from "./pages/DiscoverPage";
import BarbershopDetailPage from "./pages/BarbershopDetailPage"; // Import the BarbershopDetailPage

interface RouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <Router>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <Routes>
        {/* Главная страница */}
        <Route
          path="/"
          element={<HomePage openLoginModal={openLoginModal} />}
        />

        {/* Профиль барбера */}
        <Route
          path="/barber/:id"
          element={<BarberProfilePage openLoginModal={openLoginModal} />}
        />

        {/* Профиль барбершопа */}
        <Route
          path="/barbershop/:id"
          element={<BarbershopDetailPage openLoginModal={openLoginModal} />}
        />

        {/* Защищенный профиль пользователя */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Страница логина */}
        <Route path="/login" element={<LoginPage />} />

        {/* Страница поиска барберов */}
        <Route
          path="/discover"
          element={<DiscoverPage openLoginModal={openLoginModal} />}
        />

        {/* Старые маршруты для обратной совместимости */}
        <Route path="/barbers" element={<Navigate to="/discover" replace />} />
        <Route
          path="/barbershops"
          element={<Navigate to="/discover" replace />}
        />

        {/* Защищенные маршруты для барберов */}
        <Route
          path="/add-service"
          element={
            <ProtectedRoute>
              <AddServicePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit-service/:id"
          element={
            <ProtectedRoute>
              <EditServicePage />
            </ProtectedRoute>
          }
        />

        {/* 404 страница */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
