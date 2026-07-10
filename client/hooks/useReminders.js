'use client';
import { useState, useEffect, useRef } from 'react';
import { expandRecurringEvents } from '@/lib/utils';

export function useReminders(events) {
  const [pending, setPending] = useState([]);
  const firedRef = useRef(new Set());

  useEffect(() => {
    const check = () => {
      if (!events?.length) return;
      const now = Date.now();
      const rangeStart = new Date(now - 30 * 60 * 1000);
      const rangeEnd   = new Date(now + 25 * 60 * 60 * 1000);
      const expanded   = expandRecurringEvents(events, rangeStart, rangeEnd);
      const toFire     = [];

      for (const ev of expanded) {
        if (!ev.reminder) continue;
        const reminderAt = new Date(ev.start).getTime() - ev.reminder * 60 * 1000;
        if (reminderAt > now) continue;
        if (reminderAt < now - 30 * 60 * 1000) continue;
        const key = `${ev._id}|${String(ev.start)}`;
        if (firedRef.current.has(key)) continue;
        firedRef.current.add(key);
        toFire.push({ key, event: ev });

        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            const minsLeft = Math.round((new Date(ev.start).getTime() - now) / 60000);
            const body = minsLeft > 0 ? `מתחיל בעוד ${minsLeft} דקות` : 'מתחיל עכשיו';
            new Notification(ev.title, { body, icon: '/icon-192.png', tag: key });
          }
        } catch {}
      }

      if (toFire.length) setPending(prev => [...prev, ...toFire]);
    };

    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [events]);

  useEffect(() => {
    if (!('setAppBadge' in navigator)) return;
    if (pending.length > 0) navigator.setAppBadge(pending.length);
    else navigator.clearAppBadge?.();
  }, [pending.length]);

  const dismiss = (key) => setPending(p => p.filter(r => r.key !== key));

  return { pending, dismiss };
}
