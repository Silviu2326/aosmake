import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

// Tipos de notificaciones
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Contexto de notificaciones
interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
  loading: (title: string, message?: string) => string;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Hook para usar notificaciones
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Provider de notificaciones
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const success = useCallback((title: string, message?: string) => 
    addNotification({ type: 'success', title, message }), [addNotification]);
  
  const error = useCallback((title: string, message?: string) => 
    addNotification({ type: 'error', title, message }), [addNotification]);
  
  const warning = useCallback((title: string, message?: string) => 
    addNotification({ type: 'warning', title, message }), [addNotification]);
  
  const info = useCallback((title: string, message?: string) => 
    addNotification({ type: 'info', title, message }), [addNotification]);
  
  const loading = useCallback((title: string, message?: string) => 
    addNotification({ type: 'loading', title, message, duration: 0 }), [addNotification]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      addNotification, 
      removeNotification,
      success,
      error,
      warning,
      info,
      loading
    }}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Componente Toast individual
const NotificationToast: React.FC<{ 
  notification: Notification;
  onClose: () => void;
}> = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle size={20} className="text-green-400" />,
    error: <AlertCircle size={20} className="text-red-400" />,
    warning: <AlertTriangle size={20} className="text-yellow-400" />,
    info: <Info size={20} className="text-blue-400" />,
    loading: <Loader2 size={20} className="text-accent animate-spin" />
  };

  const bgColors = {
    success: 'border-l-green-500 bg-green-500/10',
    error: 'border-l-red-500 bg-red-500/10',
    warning: 'border-l-yellow-500 bg-yellow-500/10',
    info: 'border-l-blue-500 bg-blue-500/10',
    loading: 'border-l-accent bg-accent/10'
  };

  return (
    <div 
      className={`
        flex items-start gap-3 p-4 rounded-lg border border-border 
        ${bgColors[notification.type]} 
        shadow-lg min-w-[320px] max-w-md
        animate-slide-in-right
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {icons[notification.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium">{notification.title}</p>
        {notification.message && (
          <p className="text-gray-400 text-sm mt-1">{notification.message}</p>
        )}
        {notification.action && (
          <button
            onClick={notification.action.onClick}
            className="text-accent text-sm mt-2 hover:underline"
          >
            {notification.action.label}
          </button>
        )}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 text-gray-400 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

// Contenedor de notificaciones
const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-3 pointer-events-none">
      {notifications.map(notification => (
        <div key={notification.id} className="pointer-events-auto">
          <NotificationToast 
            notification={notification} 
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};

// Componente de progress bar para notificaciones
interface LoadingNotificationProps {
  id: string;
  title: string;
  message?: string;
  progress?: number;
  onCancel?: () => void;
}

export const LoadingNotification: React.FC<LoadingNotificationProps> = ({
  id,
  title,
  message,
  progress = 0,
  onCancel
}) => {
  const { removeNotification } = useNotification();

  return (
    <div 
      className="flex items-start gap-3 p-4 rounded-lg border border-border bg-accent/10 shadow-lg min-w-[320px] max-w-md"
    >
      <div className="flex-shrink-0 mt-0.5">
        <Loader2 size={20} className="text-accent animate-spin" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium">{title}</p>
        {message && (
          <p className="text-gray-400 text-sm mt-1">{message}</p>
        )}
        <div className="mt-3 h-1 bg-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">{progress}% completado</span>
          {onCancel && (
            <button
              onClick={() => {
                onCancel();
                removeNotification(id);
              }}
              className="text-xs text-gray-400 hover:text-white"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook para notificaciones de operaciones bulk
export const useBulkOperationNotifications = () => {
  const { addNotification, removeNotification, success, error } = useNotification();

  const notifyBulkStart = (count: number) => {
    return addNotification({
      type: 'loading',
      title: 'Procesando leads',
      message: `${count} leads seleccionados`,
      duration: 0
    });
  };

  const notifyBulkProgress = (id: string, current: number, total: number) => {
    // Para actualizaciones de progreso, necesitaríamos implementar un update
    // Por ahora simplificado
  };

  const notifyBulkComplete = (id: string, count: number, successful: number) => {
    removeNotification(id);
    if (successful === count) {
      success(
        'Operación completada',
        `${count} leads procesados correctamente`
      );
    } else {
      warning(
        'Operación parcial',
        `${successful} de ${count} leads procesados`
      );
    }
  };

  const notifyBulkError = (id: string, errorMessage: string) => {
    removeNotification(id);
    error('Error en operación', errorMessage);
  };

  const warning = useCallback((title: string, message?: string) => 
    addNotification({ type: 'warning', title, message }), [addNotification]);

  return {
    notifyBulkStart,
    notifyBulkProgress,
    notifyBulkComplete,
    notifyBulkError
  };
};

export default NotificationProvider;
