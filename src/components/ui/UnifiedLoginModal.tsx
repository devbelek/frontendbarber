import React, { useState } from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import Button from "./Button";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../api/services";
import { useNotification } from "../../context/NotificationContext";
import { jwtDecode } from "jwt-decode";

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const notification = useNotification();
  // const navigate = useNavigate();
  const [formMode, setFormMode] = useState<"google" | "email">("google");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  if (!isOpen) return null;

  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential) throw new Error("Нет токена");

      const decoded: any = jwtDecode(credentialResponse.credential);
      const response = await authAPI.googleAuth(
        credentialResponse.credential,
        "client"
      );

      if (response.data.access) {
        localStorage.setItem("authToken", response.data.access);
        localStorage.setItem("authRefreshToken", response.data.refresh);
        notification.success("Вход выполнен", "Добро пожаловать!");
        onClose();
        // navigate("/") — если используете react-router
        window.location.reload(); // временно, до внедрения полной авторизации
      }
    } catch (error) {
      console.error("Google login error:", error);
      notification.error("Ошибка", "Не удалось войти через Google");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      localStorage.setItem("authToken", response.data.access);
      if (response.data.refresh) {
        localStorage.setItem("authRefreshToken", response.data.refresh);
      }
      notification.success("Вход выполнен", "Добро пожаловать!");
      onClose();
      // navigate("/") — если используете react-router
      window.location.reload();
    } catch (err) {
      notification.error("Ошибка входа", "Проверьте данные и попробуйте снова");
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
          aria-label="Закрыть модальное окно"
        >
          <X className="h-6 w-6" />
        </button>

        <h2
          id="login-modal-title"
          className="text-xl font-bold text-center mb-6"
        >
          Вход в систему
        </h2>

        <div className="flex justify-center mb-4 space-x-6 text-lg font-semibold text-gray-800">
          <button
            onClick={() => setFormMode("google")}
            className={`pb-2 border-b-2 ${
              formMode === "google" ? "border-[#9A0F34]" : "border-transparent"
            }`}
          >
            Google
          </button>
          <button
            onClick={() => setFormMode("email")}
            className={`pb-2 border-b-2 ${
              formMode === "email" ? "border-[#9A0F34]" : "border-transparent"
            }`}
          >
            Email
          </button>
        </div>

        {formMode === "google" ? (
          <div className="flex flex-col items-center space-y-4">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() =>
                notification.error("Ошибка", "Не удалось войти через Google")
              }
            />
            <p className="text-gray-600 text-sm">
              Используйте Google аккаунт для быстрого входа
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
            />
            <input
              type="password"
              placeholder="Пароль"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9A0F34]"
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              variant="primary"
            >
              {loading ? "Вход..." : "Войти"}
            </Button>
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
                onClick={() =>
                  notification.info("В разработке", "Сброс пароля будет позже")
                }
              >
                Забыли пароль?
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default UnifiedLoginModal;
