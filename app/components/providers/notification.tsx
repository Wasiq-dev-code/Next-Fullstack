"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { 
  AiOutlineCheckCircle, 
  AiOutlineCloseCircle, 
  AiOutlineWarning, 
  AiOutlineInfoCircle 
} from "react-icons/ai";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
    id: number;
  } | null>(null);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    const id = Date.now();
    setNotification({ message, type, id });
    setTimeout(() => {
      setNotification((current) => (current?.id === id ? null : current));
    }, 5000);
  }, []);  

  const getStyles = (type: NotificationType) => {
    const baseStyles = "px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[320px] max-w-md";
    
    switch (type) {
      case "success":
        return `${baseStyles} bg-green-500 text-white`;
      case "error":
        return `${baseStyles} bg-red-500 text-white`;
      case "warning":
        return `${baseStyles} bg-yellow-500 text-gray-900`;
      case "info":
        return `${baseStyles} bg-blue-500 text-white`;
      default:
        return `${baseStyles} bg-gray-500 text-white`;
    }
  };

  const getIcon = (type: NotificationType) => {
    const iconClass = "text-2xl flex-shrink-0"; // Icon size
    
    switch (type) {
      case "success":
        return <AiOutlineCheckCircle className={iconClass} />;
      case "error":
        return <AiOutlineCloseCircle className={iconClass} />;
      case "warning":
        return <AiOutlineWarning className={iconClass} />;
      case "info":
        return <AiOutlineInfoCircle className={iconClass} />;
      default:
        return <AiOutlineInfoCircle className={iconClass} />;
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className="fixed bottom-4 right-4 z-100 animate-slide-in-right">
          <div className={getStyles(notification.type)}>
            <div className="shrink-0">
              {getIcon(notification.type)}
            </div>
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
}