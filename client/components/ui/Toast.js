'use client';
import { CheckCircle, XCircle, Info, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotification } from '@/context/NotificationContext';

export function ToastContainer() {
  const { notifications, hideNotification } = useNotification();
  if (!notifications.length) return null;

  const icons = {
    success: <CheckCircle size={15} />,
    error:   <XCircle size={15} />,
    info:    <Info size={15} />,
  };
  const colors = {
    success: 'border-green-500/40 text-green-400',
    error:   'border-red-500/40   text-red-400',
    info:    'border-[#c9a96e]/40 text-[#c9a96e]',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2">
      {notifications.map(n => (
        <div
          key={n.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border bg-[var(--eb-surface)] shadow-lg text-sm font-medium animate-slide-in-right',
            colors[n.type] || colors.success
          )}
        >
          {icons[n.type] || icons.success}
          <span className="text-[var(--eb-text)]">{n.message}</span>
          {n.showUndo && n.onUndo && (
            <button
              onClick={() => { n.onUndo(); hideNotification(n.id); }}
              className="flex items-center gap-1 text-[#c9a96e] hover:text-[#d4ba85] transition-colors text-xs font-bold"
            >
              <RotateCcw size={12} /> ביטול
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
