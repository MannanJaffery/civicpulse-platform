import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500 shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/90 text-emerald-950';
      case 'error':
        return 'border-red-200 bg-red-50/90 text-red-950';
      case 'warning':
        return 'border-amber-200 bg-amber-50/90 text-amber-950';
      case 'info':
      default:
        return 'border-blue-200 bg-blue-50/90 text-blue-950';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md max-w-md w-full ${getBorderColor()}`}
      role="alert"
    >
      {getIcon()}
      <div className="flex-1">
        <h4 className="text-sm font-bold leading-tight">{title}</h4>
        {message && <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{message}</p>}
      </div>
      <button
        onClick={() => onClose(id)}
        className="p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4 opacity-70 hover:opacity-100" />
      </button>
    </motion.div>
  );
};
