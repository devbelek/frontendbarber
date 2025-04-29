import React from 'react';
import { X, MessageSquare } from 'lucide-react';
import Button from '../ui/Button';
import { useLanguage } from '../../context/LanguageContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Custom Comb Logo
  const CombLogo = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="h-10 w-10 text-[#9A0F34]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 3v18c0 1 1 2 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
      <path d="M8 18h8" />
    </svg>
  );

  const handleGoogleLogin = () => {
    // В реальном приложении здесь будет логика входа через Google
    console.log('Google login clicked');
    // Временная заглушка
    alert('Вход через Google будет реализован в следующей версии');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Close"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <CombLogo />
            <span className="ml-2 text-2xl font-bold">tarak</span>
          </div>

          <h2 className="text-xl font-bold text-center mb-6">Вход для барберов</h2>

          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Создайте профиль барбера, чтобы публиковать свои работы и привлекать новых клиентов
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Войти через Google
          </button>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <MessageSquare className="h-5 w-5 text-[#9A0F34] mt-1 mr-3 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Для клиентов регистрация не требуется.</strong> Просто просматривайте работы и связывайтесь с барберами напрямую через WhatsApp или Telegram.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;