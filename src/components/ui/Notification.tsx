import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose(id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const Icon = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertCircle,
  }[type];

  const bgColor = {
    success: 'bg-green-50',
    error: 'bg-red-50',
    info: 'bg-blue-50',
    warning: 'bg-yellow-50',
  }[type];

  const borderColor = {
    success: 'border-green-400',
    error: 'border-red-400',
    info: 'border-blue-400',
    warning: 'border-yellow-400',
  }[type];

  const iconColor = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400',
  }[type];

  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  }[type];

  return (
    <div
      className={`
        transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${bgColor} ${borderColor} border-l-4 p-4 mb-2 rounded-md shadow-md
      `}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${textColor}`}>{title}</p>
          {message && (
            <p className={`mt-1 text-sm ${textColor} opacity-90`}>{message}</p>
          )}
        </div>
        <div className="ml-4">
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(id), 300);
            }}
            className={`inline-flex ${textColor} hover:${textColor} focus:outline-none`}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotificationContainer: React.FC<{
  notifications: NotificationData[];
  onClose: (id: string) => void;
}> = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={onClose}
        />
      ))}
    </div>
  );
};

interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const addNotification = (
    type: NotificationType,
    title: string,
    message?: string,
    duration?: number
  ) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, title, message, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const success = (title: string, message?: string, duration?: number) =>
    addNotification('success', title, message, duration);

  const error = (title: string, message?: string, duration?: number) =>
    addNotification('error', title, message, duration);

  const info = (title: string, message?: string, duration?: number) =>
    addNotification('info', title, message, duration);

  const warning = (title: string, message?: string, duration?: number) =>
    addNotification('warning', title, message, duration);

  return {
    notifications,
    success,
    error,
    info,
    warning,
    removeNotification,
  };
};