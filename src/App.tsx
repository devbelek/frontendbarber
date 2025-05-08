// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import BarberProfilePage from './pages/BarberProfilePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginModal from './components/auth/LoginModal';
import BarberListPage from './pages/BarberListPage';
import LoginPage from './pages/LoginPage';
import AddServicePage from './pages/AddServicePage';

// Защищенный маршрут - только для авторизованных пользователей
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
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
        <Route path="/" element={<HomePage openLoginModal={openLoginModal} />} />
        <Route path="/gallery" element={<GalleryPage openLoginModal={openLoginModal} />} />
        <Route path="/barber/:id" element={<BarberProfilePage openLoginModal={openLoginModal} />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage openLoginModal={openLoginModal} />
          </ProtectedRoute>
        } />
        <Route path="/barbers" element={<BarberListPage openLoginModal={openLoginModal} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/add-service" element={
          <ProtectedRoute>
            <AddServicePage />
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
          <AppRoutes />
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;