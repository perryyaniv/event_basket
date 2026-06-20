'use client';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({ open, onClose, title, children, className }) {
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative z-10 w-full sm:max-w-md bg-[var(--eb-surface)] border border-[var(--eb-border)] sm:rounded-2xl rounded-t-2xl shadow-2xl animate-fade-in max-h-[92dvh] flex flex-col',
        className
      )}>
        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-[var(--eb-border)] flex-shrink-0">
          <h2 className="text-base font-bold text-[var(--eb-text)]">{title}</h2>
          <button onClick={onClose} className="text-[var(--eb-muted)] hover:text-[var(--eb-text)] transition-colors p-1 rounded-lg hover:bg-[var(--eb-border)]">
            <X size={18} />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
