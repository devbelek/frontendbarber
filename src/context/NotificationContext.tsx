import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { createPortal } from "react-dom";

interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationContextType {
  success: (title: string, message?: string, duration?: number) => void;
  error: (title: string, message?: string, duration?: number) => void;
  info: (title: string, message?: string, duration?: number) => void;
  warning: (title: string, message?: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (
      type: Notification["type"],
      title: string,
      message?: string,
      duration = 5000
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      setNotifications((prev) => [
        ...prev,
        { id, type, title, message, duration },
      ]);
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    },
    []
  );

  const success = useCallback(
    (title: string, message?: string, duration?: number) =>
      addNotification("success", title, message, duration),
    [addNotification]
  );

  const error = useCallback(
    (title: string, message?: string, duration?: number) =>
      addNotification("error", title, message, duration),
    [addNotification]
  );

  const info = useCallback(
    (title: string, message?: string, duration?: number) =>
      addNotification("info", title, message, duration),
    [addNotification]
  );

  const warning = useCallback(
    (title: string, message?: string, duration?: number) =>
      addNotification("warning", title, message, duration),
    [addNotification]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, success, error, info, warning, removeNotification };
};

// Компонент одного уведомления
const Notification: React.FC<
  Notification & { onClose: (id: string) => void }
> = ({ id, type, title, message, onClose }) => {
  const typeStyles = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const typeIcons = {
    success: <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />,
    error: <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />,
    info: <Info className="h-4 w-4 sm:h-5 sm:w-5" />,
    warning: <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />,
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -20, x: 0 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-[4.5rem] sm:top-12 right-2 sm:right-4 w-[90vw] max-w-[320px] sm:max-w-[400px] p-3 sm:p-4 rounded-lg shadow-lg border flex items-start space-x-2 sm:space-x-3 z-50 ${typeStyles[type]}`}
      role="alert"
      onClick={() => onClose(id)} // Закрытие по клику/касанию
    >
      <div className="flex-shrink-0">{typeIcons[type]}</div>
      <div className="flex-1">
        <h4 className="text-xs sm:text-sm font-semibold">{title}</h4>
        {message && <p className="text-xs sm:text-sm mt-1">{message}</p>}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(id);
        }}
        className="p-1 rounded-full hover:bg-gray-100/50"
        aria-label="Закрыть уведомление"
      >
        <X className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    </motion.div>,
    document.getElementById("notifications") || document.body
  );
};

// Компонент-контейнер для уведомлений
const NotificationContainer: React.FC<{
  notifications: Notification[];
  onClose: (id: string) => void;
}> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-0 right-0 z-50">
      <AnimatePresence>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            {...notification}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Провайдер уведомлений
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { notifications, success, error, info, warning, removeNotification } =
    useNotifications();

  return (
    <NotificationContext.Provider value={{ success, error, info, warning }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

// Хук для использования уведомлений
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
