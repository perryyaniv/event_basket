'use client';
import { useState, useEffect } from 'react';
import { X, Bell, BellOff } from 'lucide-react';
import { formatTime, getEventType } from '@/lib/utils';

export function ReminderBanner({ reminders, onDismiss }) {
  const [permission, setPermission] = useState('granted');

  useEffect(() => {
    if ('Notification' in window) setPermission(Notification.permission);
  }, [reminders.length]);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
    } catch {}
  };

  if (!reminders.length) return null;
  return (
    <div className="flex flex-col gap-1 px-2 py-1.5 border-b border-[var(--eb-border)]">
      {permission === 'default' && (
        <button
          onClick={requestPermission}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--eb-muted)] hover:text-[var(--eb-text)] border border-dashed border-[var(--eb-border)] transition-colors"
        >
          <BellOff size={13} />
          <span>Enable notification badge on app icon</span>
        </button>
      )}
      {reminders.map(({ key, event }) => {
        const et = getEventType(event.type);
        return (
          <div
            key={key}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{ background: `${et.color}18`, borderInlineStart: `3px solid ${et.color}` }}
          >
            <Bell size={14} className="flex-shrink-0" style={{ color: et.color }} />
            <span className="flex-1 font-medium truncate text-[var(--eb-text)]">{event.title}</span>
            <span className="text-xs text-[var(--eb-muted)]">{formatTime(event.start)}</span>
            <button onClick={() => onDismiss(key)} className="text-[var(--eb-muted)] hover:text-[var(--eb-text)] transition-colors">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
