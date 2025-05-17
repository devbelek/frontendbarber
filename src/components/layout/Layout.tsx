import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';
import FloatingActionButton from '../ui/FloatingActionButton';
import { Scissors } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  openLoginModal: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, openLoginModal }) => {
  const location = useLocation();
  const { user } = useAuth();
  const isMobile = window.innerWidth <= 768;
  const showHeader = !isMobile || location.pathname === '/';
  const showFooter = !isMobile;

  // Определяем, является ли пользователь барбером
  const isBarber = user?.profile?.user_type === 'barber';

  // Проверяем, не находимся ли мы на странице добавления/редактирования услуги
  const isAddEditServicePage =
    location.pathname === '/add-service' ||
    location.pathname.startsWith('/edit-service/');

  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header openLoginModal={openLoginModal} />}
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
      {isMobile && <MobileNavigation openLoginModal={openLoginModal} />}

      {/* Кнопка добавления для барберов */}
      {isBarber && !isAddEditServicePage && (
        <FloatingActionButton
          to="/add-service"
          icon={<Scissors className="h-5 w-5 mr-1" />}
          label="Добавить стрижку"
        />
      )}
    </div>
  );
};

export default Layout;