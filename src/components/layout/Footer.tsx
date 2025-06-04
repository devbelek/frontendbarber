import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, Smartphone } from "lucide-react";
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
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("Пользователь установил приложение");
        }
        setDeferredPrompt(null);
        setShowInstallButton(false);
      });
    }
  };

  const handleStoreClick = () => setShowComingSoonModal(true);

  const StoreButton = ({ label, icon, onClick }) => (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-500 text-white text-xs sm:text-sm px-3 py-2 rounded-xl shadow transition-all"
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const GooglePlayIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
    </svg>
  );

  const AppStoreIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.19 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
    </svg>
  );

  return (
    <>
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-8 px-4">
        <div className="container mx-auto flex flex-col lg:flex-row justify-between items-start gap-10">
          {/* Info */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center text-2xl font-bold tracking-tight text-[#D81F5A]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
                <path d="M8 6h8M8 10h8M8 14h8M8 18h8" />
              </svg>
              TARAK
            </div>
            <p className="text-gray-300 text-sm">
              Выбирай стрижку, а не барбера. Найди идеальную стрижку и запишись
              к мастеру, который её сделал.
            </p>
            <div className="flex space-x-3"></div>
          </div>

          {/* Download */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Скачать приложение</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              {showInstallButton && (
                <StoreButton
                  label="Установить"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleInstallClick}
                />
              )}
              <StoreButton
                label="Google Play"
                icon={<GooglePlayIcon />}
                onClick={handleStoreClick}
              />
              <StoreButton
                label="App Store"
                icon={<AppStoreIcon />}
                onClick={handleStoreClick}
              />
              {!showInstallButton && (
                <Link
                  to="/install"
                  className="flex items-center space-x-2 bg-[#7b0c29] hover:bg-[#9a0f34] text-white px-3 py-2 rounded-xl shadow text-xs sm:text-sm"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{t("Dowload")}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-6 border-t border-gray-700 pt-4 text-center text-xs text-gray-400">
          <p>© 2025 TARAK. Все права защищены.</p>
        </div>
      </footer>

      {/* Coming soon modal */}
      {showComingSoonModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full text-center shadow-xl">
            <div className="w-14 h-14 bg-gradient-to-br from-[#D81F5A] to-[#B0184A] rounded-full flex items-center justify-center mx-auto mb-3">
              <Smartphone className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Скоро!</h3>
            <p className="text-gray-700 text-xs mb-4 leading-relaxed">
              Мы работаем над мобильным приложением TARAK. Совсем скоро оно
              будет доступно в Google Play и App Store!
            </p>
            <button
              onClick={() => setShowComingSoonModal(false)}
              className="bg-[#D81F5A] hover:bg-[#7b0c29] text-white px-4 py-2 rounded-lg text-xs font-semibold"
            >
              Понятно
            </button>
            <p className="text-[0.6rem] text-gray-500 mt-2">
              А пока используйте веб-версию в браузере
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
