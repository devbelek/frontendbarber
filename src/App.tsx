// src/App.tsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { LocationProvider } from './context/LocationContext';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import BarberProfilePage from './pages/BarberProfilePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginModal from './components/auth/LoginModal';
import BarberListPage from './pages/BarberListPage';
import LoginPage from './pages/LoginPage';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  return (
    <LanguageProvider>
      <AuthProvider>
        <LocationProvider>
          <Router>
            <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />
            <Routes>
              <Route path="/" element={<HomePage openLoginModal={openLoginModal} />} />
              <Route path="/gallery" element={<GalleryPage openLoginModal={openLoginModal} />} />
              <Route path="/barber/:id" element={<BarberProfilePage openLoginModal={openLoginModal} />} />
              <Route path="/profile" element={<ProfilePage openLoginModal={openLoginModal} />} />
              <Route path="/barbers" element={<BarberListPage openLoginModal={openLoginModal} />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </LocationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;