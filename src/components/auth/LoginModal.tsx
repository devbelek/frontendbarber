import React from "react";
import { X, MessageSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import * as jwtDecode from "jwt-decode";
import { authAPI } from "../../api/services";
import { useNotification } from "../../context/NotificationContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithGoogle } = useAuth();
  const notification = useNotification();

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
      <path d="M5 3v18c0 1 2 2h10c1 0 2-1 2-2V3c0-1-1-2-2-2H7c-1 0-2 1-2 2z" />
      <path d="M8 6h8" />
      <path d="M8 10h8" />
      <path d="M8 14h8" />
      <path d="M8 18h8" />
    </svg>
  );

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode.jwtDecode(credentialResponse.credential);
      console.log("Google login success:", decoded);

      // Extract relevant user info
      const userInfo = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
      };

      // Отправляем токен на бэкенд с явным указанием типа 'client'
      const response = await authAPI.googleAuth(
        credentialResponse.credential,
        "client"
      );

      if (response.data.access) {
        localStorage.setItem("token", response.data.access);
        if (response.data.refresh) {
          localStorage.setItem("refreshToken", response.data.refresh);
        }
        if (response.data.user) {
          localStorage.setItem(
            "googleUser",
            JSON.stringify(response.data.user)
          );
        }
      } else {
        const tempToken = `google-auth-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 15)}`;
        localStorage.setItem("token", tempToken);
        localStorage.setItem("googleUser", JSON.stringify(userInfo));
      }

      // Login with Google
      loginWithGoogle(userInfo);

      // Close modal
      onClose();

      // Show success message
      setTimeout(() => {
        notification.success("Вход выполнен", "Вы успешно вошли в систему!");
      }, 500);
    } catch (error) {
      console.error("Error processing Google login:", error);
      notification.error(
        "Ошибка входа",
        "Произошла ошибка при входе через Google. Пожалуйста, попробуйте ещё раз."
      );
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google login failed");
    notification.error(
      "Ошибка Google",
      "Не удалось выполнить вход через Google. Пожалуйста, попробуйте ещё раз."
    );
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

          <h2 className="text-xl font-bold text-center mb-6">Вход в систему</h2>

          <div className="mb-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              Войдите в систему, чтобы получить доступ к персонализированным
              функциям
            </p>
          </div>

          <div className="mb-6">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginError}
              useOneTap
              theme="outline"
              shape="rectangular"
              logo_alignment="center"
              text="signin_with"
              locale="ru"
              width="300"
            />
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <MessageSquare className="h-5 w-5 text-[#9A0F34] mt-1 mr-3 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                <strong>Для клиентов регистрация не требуется.</strong> Просто
                просматривайте работы и связывайтесь с барберами напрямую через
                WhatsApp или Telegram.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
