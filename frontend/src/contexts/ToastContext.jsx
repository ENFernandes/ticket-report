import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Warning, Info, X } from '@phosphor-icons/react';

const ToastContext = createContext(null);

const TOAST_DURATION = 4000;

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: Warning,
  info: Info,
};

const toastStyles = {
  success: 'border-status-resolved/30 bg-status-resolved/10',
  error: 'border-red-500/30 bg-red-500/10',
  warning: 'border-status-pending/30 bg-status-pending/10',
  info: 'border-status-progress/30 bg-status-progress/10',
};

const iconStyles = {
  success: 'text-status-resolved',
  error: 'text-red-500',
  warning: 'text-status-pending',
  info: 'text-status-progress',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, TOAST_DURATION);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    warning: (message) => addToast(message, 'warning'),
    info: (message) => addToast(message, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(({ id, message, type }) => {
          const Icon = toastIcons[type];
          return (
            <div
              key={id}
              className={`
                pointer-events-auto flex items-center gap-3 px-4 py-3 
                rounded-md border backdrop-blur-sm
                animate-slide-up shadow-lg
                ${toastStyles[type]}
              `}
            >
              <Icon weight="fill" className={`w-5 h-5 shrink-0 ${iconStyles[type]}`} />
              <span className="text-sm text-dark-100">{message}</span>
              <button
                onClick={() => removeToast(id)}
                className="ml-2 p-1 rounded hover:bg-dark-700/50 transition-colors"
              >
                <X className="w-4 h-4 text-dark-400" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
