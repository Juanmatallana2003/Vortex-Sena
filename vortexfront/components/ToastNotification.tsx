import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const ToastNotification: React.FC<ToastProps> = ({ id, message, type, duration = 3000, onClose }) => {
  const[isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeño retraso para que la animación de entrada funcione
    setTimeout(() => setIsVisible(true), 10);

    const timer = setTimeout(() => {
      setIsVisible(false);
      // Esperar a que termine la animación de salida antes de desmontar
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  },[id, duration, onClose]);

  const bgColor = type === 'success' ? 'bg-[#2ea043]' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-circle-exclamation' : 'fa-info-circle';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${bgColor}`}
    >
      <i className={`fa-solid ${icon} text-lg`}></i>
      <span>{message}</span>
      <button onClick={() => { setIsVisible(false); setTimeout(() => onClose(id), 300); }} className="ml-2 opacity-70 hover:opacity-100 transition-opacity">
        <i className="fa-solid fa-xmark"></i>
      </button>
    </div>
  );
};

export default ToastNotification;