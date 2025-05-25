// src/App.tsx с обновлённой интеграцией - галерея перенаправляется на главную
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
// Импортируем обновленную HomePage
import HomePage from './pages/HomePage';
import BarberProfilePage from './pages/BarberProfilePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginModal from './components/auth/LoginModal';
import BarberListPage from './pages/BarberListPage';
import LoginPage from './pages/LoginPage';
import AddServicePage from './pages/AddServicePage';
import { NotificationProvider } from './context/NotificationContext';
import EditServicePage from './pages/EditServicePage';

// Тип для пропсов с openLoginModal
interface RouteProps {
  children: React.ReactNode;
}

// Защищенный маршрут - только для авторизованных пользователей
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
        {/* Главная страница с интегрированной галереей */}
        <Route path="/" element={<HomePage openLoginModal={openLoginModal} />} />

        {/* Перенаправление галереи на главную страницу */}
        <Route path="/gallery" element={<Navigate to="/" replace />} />

        {/* Остальные маршруты */}
        <Route path="/barber/:id" element={<BarberProfilePage openLoginModal={openLoginModal} />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/barbers" element={<BarberListPage openLoginModal={openLoginModal} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/add-service" element={
          <ProtectedRoute>
            <AddServicePage />
          </ProtectedRoute>
        } />
        <Route path="/edit-service/:id" element={
          <ProtectedRoute>
            <EditServicePage />
          </ProtectedRoute>
        } />
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