import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';
import FloatingActionButton from '../ui/FloatingActionButton';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import InstallModal from '../ui/InstallModal'; // Укажи правильный путь

interface LayoutProps {
  children: React.ReactNode;
  openLoginModal: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, openLoginModal }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = window.innerWidth <= 768;

  const isBarber = user?.profile?.user_type === 'barber';
  const isAddEditServicePage =
    location.pathname === '/add-service' ||
    location.pathname.startsWith('/edit-service/');
  const isHomePage = location.pathname === '/';

  // Логика для PWA и модального окна
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e); // Сохраняем событие для вызова установки
      setIsInstallModalOpen(true); // Открываем модальное окно
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Очищаем слушатель при размонтировании компонента
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt(); // Запускаем установку
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Пользователь установил приложение');
        } else {
          console.log('Пользователь отказался от установки');
        }
        setDeferredPrompt(null);
        setIsInstallModalOpen(false); // Закрываем модальное окно
      });
    }
  };

  const closeInstallModal = () => {
    setIsInstallModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header openLoginModal={openLoginModal} isTransparent={isHomePage} />
      <main className="flex-grow">{children}</main>
      <Footer />

      {isMobile && <MobileNavigation openLoginModal={openLoginModal} />}

      {isBarber && !isAddEditServicePage && (
        <FloatingActionButton
          to="/add-service"
          icon={<Plus className="h-6 w-6" />}
          label="Добавить стрижку"
        />
      )}

      {/* Добавляем модальное окно */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={closeInstallModal}
        onInstall={handleInstall}
      />
    </div>
  );
};

export default Layout;