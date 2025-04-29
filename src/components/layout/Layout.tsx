import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileNavigation from './MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
  openLoginModal: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, openLoginModal }) => {
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;
  const showHeader = !isMobile || location.pathname === '/';
  const showFooter = !isMobile;

  return (
    <div className="flex flex-col min-h-screen">
      {showHeader && <Header openLoginModal={openLoginModal} />}
      <main className="flex-grow">
        {children}
      </main>
      {showFooter && <Footer />}
      {isMobile && <MobileNavigation openLoginModal={openLoginModal} />}
    </div>
  );
};

export default Layout;