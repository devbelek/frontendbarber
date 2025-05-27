import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import { NotificationProvider } from './context/NotificationContext';
import HomePage from './pages/HomePage';
import BarberProfilePage from './pages/BarberProfilePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginModal from './components/auth/LoginModal';
import BarberListPage from './pages/BarberListPage';
import LoginPage from './pages/LoginPage';
import AddServicePage from './pages/AddServicePage';
import EditServicePage from './pages/EditServicePage';

// Тип для пропсов защищенного маршрута
interface RouteProps {
  children: React.ReactNode;
}

// Компонент защищенного маршрута для авторизованных пользователей
const ProtectedRoute: React.FC<RouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Отображаем загрузку, пока проверяется статус авторизации
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9A0F34]"></div>
      </div>
    );
  }

  // Если пользователь не авторизован, перенаправляем на страницу логина
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Компонент маршрутизации приложения
const AppRoutes = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Функция открытия модального окна логина
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  // Функция закрытия модального окна логина
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <Router>
      {/* Модальное окно логина, управляемое состоянием */}
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
      <Routes>
        {/* Главная страница с интегрированной галереей */}
        <Route path="/" element={<HomePage openLoginModal={openLoginModal} />} />

        {/* Перенаправление с /gallery на главную страницу */}
        <Route path="/gallery" element={<Navigate to="/" replace />} />

        {/* Маршрут для профиля барбера */}
        <Route path="/barber/:id" element={<BarberProfilePage openLoginModal={openLoginModal} />} />

        {/* Защищенный маршрут для профиля пользователя */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Список барберов */}
        <Route path="/barbers" element={<BarberListPage openLoginModal={openLoginModal} />} />

        {/* Страница логина */}
        <Route path="/login" element={<LoginPage />} />

        {/* Защищенный маршрут для добавления услуги */}
        <Route
          path="/add-service"
          element={
            <ProtectedRoute>
              <AddServicePage />
            </ProtectedRoute>
          }
        />

        {/* Защищенный маршрут для редактирования услуги */}
        <Route
          path="/edit-service/:id"
          element={
            <ProtectedRoute>
              <EditServicePage />
            </ProtectedRoute>
          }
        />

        {/* Обработка неизвестных маршрутов (404) */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
};

// Основной компонент приложения
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