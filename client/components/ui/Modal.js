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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={cn(
        'relative z-10 w-full max-w-md bg-[#222240] border border-[#2e2e50] rounded-2xl shadow-2xl animate-fade-in',
        className
      )}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#2e2e50]">
          <h2 className="text-base font-bold text-[#faf9f6]">{title}</h2>
          <button onClick={onClose} className="text-[#8888aa] hover:text-[#faf9f6] transition-colors p-1 rounded-lg hover:bg-[#2e2e50]">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
