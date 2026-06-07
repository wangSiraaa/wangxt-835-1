import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export const Toast: React.FC = () => {
  const { showRefreshToast, toastMessage, hideToast } = useUIStore();

  const getTypeStyles = (): { bg: string; border: string; icon: React.ReactNode } => {
    const message = toastMessage.toLowerCase();
    
    if (message.includes('成功') || message.includes('恢复') || message.includes('完成')) {
      return {
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      };
    }
    if (message.includes('失败') || message.includes('错误') || message.includes('无法')) {
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      };
    }
    if (message.includes('警告') || message.includes('注意')) {
      return {
        bg: 'bg-amber-500/20',
        border: 'border-amber-500/30',
        icon: <AlertCircle className="w-5 h-5 text-amber-400" />,
      };
    }
    return {
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
      icon: <Info className="w-5 h-5 text-cyan-400" />,
    };
  };

  const styles = getTypeStyles();

  if (!showRefreshToast) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-xl ${styles.bg} ${styles.border}`}
      >
        {styles.icon}
        <span className="text-sm text-slate-200">{toastMessage}</span>
        <button
          onClick={hideToast}
          className="ml-2 p-1 hover:bg-slate-700/50 rounded transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
