import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('Пользователь установил приложение');
        } else {
          console.log('Пользователь отказался');
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  return (
    <footer className="bg-gray-100 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="border-t border-gray-300 pt-4 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>© 2025 TARAK. Все права защищены.</p>
          <div className="space-x-4 mt-3 md:mt-0">
            <a href="#" className="hover:text-[#9A0F34]">Условия использования</a>
            <a href="#" className="hover:text-[#9A0F34]">Политика конфиденциальности</a>
          </div>
        </div>
        {/* Кнопка установки */}
        <div className="text-center mt-4">
          {showInstallButton ? (
            <button
              onClick={handleInstallClick}
              className="bg-[#9A0F34] text-white px-4 py-2 rounded hover:bg-[#7b0c29]"
            >
              {t('installApp')}
            </button>
          ) : (
            <Link to="/install" className="text-[#9A0F34] hover:underline">
              {t('installApp')}
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;