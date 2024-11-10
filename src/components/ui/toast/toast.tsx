// src/components/ui/toast/toast.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  variant?: 'default' | 'success' | 'error';
  title?: string;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  variant = 'default',
  title,
  message,
  duration = 3000,
  onClose
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm transition-all',
        {
          'bg-white text-gray-900': variant === 'default',
          'bg-green-100 text-green-900': variant === 'success',
          'bg-red-100 text-red-900': variant === 'error',
        }
      )}
    >
      {title && (
        <h4 className="font-medium mb-1">{title}</h4>
      )}
      <p className="text-sm">{message}</p>
    </div>
  );
};

// src/components/ui/toast/toaster.tsx
import React, { useState, useCallback } from 'react';
import { Toast } from './toast';

interface ToastMessage {
  id: string;
  variant?: 'default' | 'success' | 'error';
  title?: string;
  message: string;
}

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          variant={toast.variant}
          title={toast.title}
          message={toast.message}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// src/hooks/useToast.ts
import { useContext, createContext } from 'react';

interface ToastContextType {
  showToast: (message: string, options?: {
    title?: string;
    variant?: 'default' | 'success' | 'error';
  }) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// src/providers/ToastProvider.tsx
import React, { useState, useCallback } from 'react';
import { ToastContext } from '@/hooks/useToast';
import { Toaster } from '@/components/ui/toast/toaster';

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    title?: string;
    variant?: 'default' | 'success' | 'error';
  }>>([]);

  const showToast = useCallback((message: string, options = {}) => {
    const id = Math.random().toString(36).substring(7);
    setToasts(prev => [...prev, { id, message, ...options }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};