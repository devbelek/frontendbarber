import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import GalleryPage from './pages/GalleryPage';
import BarberProfilePage from './pages/BarberProfilePage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import LoginModal from './components/auth/LoginModal';

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
          <Routes>
            <Route path="/" element={<HomePage openLoginModal={() => setIsLoginModalOpen(true)} />} />
            <Route path="/gallery" element={<GalleryPage openLoginModal={() => setIsLoginModalOpen(true)} />} />
            <Route path="/barber/:id" element={<BarberProfilePage openLoginModal={() => setIsLoginModalOpen(true)} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;