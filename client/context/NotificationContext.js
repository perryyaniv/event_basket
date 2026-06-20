'use client';
import { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider');
  return ctx;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const showNotification = useCallback((message, options = {}) => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type: options.type || 'success',
      duration: options.duration ?? 3500,
      showUndo: options.showUndo || false,
      onUndo: options.onUndo,
    };
    setNotifications(prev => [...prev, notification]);
    if (notification.duration > 0) {
      setTimeout(() => hideNotification(id), notification.duration);
    }
    return id;
  }, []);

  const hideNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
