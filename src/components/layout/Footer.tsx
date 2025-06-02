import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Facebook,
  Twitter,
  Download,
  Smartphone,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Пользователь установил приложение");
        } else {
          console.log("Пользователь отказался");
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  const handleStoreClick = (store) => {
    setShowComingSoonModal(true);
  };

  const GooglePlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );

  const AppStoreIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.19 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
    </svg>
  );

  return (
    <>
      <footer className="bg-gradient-to-r from-gray-800 to-gray-700 text-white py-6 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* О компании */}
            <div className="space-y-3">
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-[#D81F5A] mr-2"
                >
                  <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
                  <path d="M8 6h8" />
                  <path d="M8 10h8" />
                  <path d="M8 14h8" />
                  <path d="M8 18h8" />
                </svg>
                <span className="text-2xl font-extrabold tracking-tight">
                  TARAK
                </span>
              </div>
              <p className="text-gray-200 text-xs leading-relaxed max-w-xs">
                Выбирай стрижку, а не барбера. Найди идеальную стрижку и
                запишись к мастеру, который ее сделал.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#D81F5A] transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#D81F5A] transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#D81F5A] transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Скачать приложение */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-wide">
                Скачать приложение
              </h3>
              <div className="flex flex-col space-y-2">
                {showInstallButton && (
                  <button
                    onClick={handleInstallClick}
                    className="w-auto min-w-[120px] bg-[#7b0c29] hover:bg-[#9a0f34] text-white px-2 py-1 rounded-lg transition-colors flex items-center justify-center space-x-1 shadow-sm text-[0.65rem] sm:text-xs"
                  >
                    <Download className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="truncate">Установить приложение</span>
                  </button>
                )}
                <button
                  onClick={() => handleStoreClick("googleplay")}
                  className="w-auto min-w-[120px] bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 shadow-sm text-[0.65rem] sm:text-xs"
                >
                  <GooglePlayIcon />
                  <div className="text-left">
                    <div className="text-[0.6rem] sm:text-xs text-gray-200">
                      Скачать в
                    </div>
                    <div className="truncate">Google Play</div>
                  </div>
                </button>
                <button
                  onClick={() => handleStoreClick("appstore")}
                  className="w-auto min-w-[120px] bg-gray-600 hover:bg-gray-500 text-white px-2 py-1 rounded-lg transition-colors flex items-center space-x-1 shadow-sm text-[0.65rem] sm:text-xs"
                >
                  <AppStoreIcon />
                  <div className="text-left">
                    <div className="text-[0.6rem] sm:text-xs text-gray-200">
                      Скачать в
                    </div>
                    <div className="truncate">App Store</div>
                  </div>
                </button>
                {!showInstallButton && (
                  <Link
                    to="/install"
                    className="w-auto min-w-[120px] bg-[#7b0c29] hover:bg-[#B0184A] text-white px-2 py-1 rounded-lg transition-colors flex items-center justify-center space-x-1 shadow-sm text-[0.65rem] sm:text-xs"
                  >
                    <Smartphone className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    <span className="truncate">{t("Dowload")}</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Нижняя часть футера */}
          <div className="border-t border-gray-600 mt-6 pt-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <div className="text-xs text-gray-300">
                © 2025 TARAK. Все права защищены.
              </div>
              <div className="flex space-x-6 text-xs">
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#D81F5A] transition-colors"
                >
                  Условия использования
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#D81F5A] transition-colors"
                >
                  Политика конфиденциальности
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-[#D81F5A] transition-colors"
                >
                  Пользовательское соглашение
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Модальное окно "Скоро" */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full text-center shadow-xl">
            <div className="w-14 h-14 bg-gradient-to-br from-[#D81F5A] to-[#B0184A] rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Скоро!</h3>
            <p className="text-gray-700 text-[0.65rem] sm:text-xs mb-3 leading-relaxed">
              Мы работаем над мобильным приложением TARAK. Совсем скоро оно
              будет доступно в Google Play и App Store!
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setShowComingSoonModal(false)}
                className="w-auto min-w-[100px] bg-[#D81F5A] text-white px-2 py-1 rounded-lg hover:bg-[#7b0c29] transition-colors font-semibold shadow-sm text-[0.65rem] sm:text-xs"
              >
                Понятно
              </button>
              <p className="text-[0.6rem] sm:text-xs text-gray-500">
                А пока используйте веб-версию в браузере
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
