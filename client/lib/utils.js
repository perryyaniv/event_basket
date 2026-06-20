import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const EVENT_TYPES = [
  { key: 'general',  color: '#5b8dee', emoji: '📅' },
  { key: 'doctor',   color: '#e05252', emoji: '🏥' },
  { key: 'birthday', color: '#e8699a', emoji: '🎂' },
  { key: 'reminder', color: '#f0c040', emoji: '🔔' },
  { key: 'meeting',  color: '#9b6ddf', emoji: '👥' },
  { key: 'holiday',  color: '#3ec9c9', emoji: '✈️' },
  { key: 'sport',    color: '#f07840', emoji: '🏋️' },
  { key: 'school',   color: '#5b7ec9', emoji: '🎓' },
  { key: 'social',   color: '#4caf7d', emoji: '🎉' },
  { key: 'family',   color: '#c9895b', emoji: '🏠' },
];

export function getEventType(key) {
  return EVENT_TYPES.find(t => t.key === key) || EVENT_TYPES[0];
}

export const RECURRENCE_OPTIONS = ['once', 'daily', 'weekly', 'monthly', 'yearly'];

export function formatDate(date, locale = 'he-IL') {
  return new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatTime(date, locale = 'he-IL') {
  return new Date(date).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function isSameDay(a, b) {
  const da = new Date(a), db = new Date(b);
  return da.getFullYear() === db.getFullYear() &&
         da.getMonth() === db.getMonth() &&
         da.getDate() === db.getDate();
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Returns all calendar dates (incl. prev/next month overflow) for a given month grid
export function getCalendarDays(year, month) {
  const firstDay = getFirstDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    const d = new Date(year, month, 1 - (firstDay - i));
    days.push({ date: d, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d), currentMonth: true });
  }
  const remaining = 42 - days.length;
  for (let d = 1; d <= remaining; d++) {
    days.push({ date: new Date(year, month + 1, d), currentMonth: false });
  }
  return days;
}

// Expand recurring events into instances within a date range
export function expandRecurringEvents(events, rangeStart, rangeEnd) {
  const result = [];
  for (const event of events) {
    const { recurrence } = event;
    if (!recurrence || recurrence.frequency === 'once') {
      result.push(event);
      continue;
    }
    const start = new Date(event.start);
    const end = recurrence.endDate ? new Date(recurrence.endDate) : new Date(rangeEnd);
    const current = new Date(start);
    while (current <= end && current <= new Date(rangeEnd)) {
      if (current >= new Date(rangeStart)) {
        const diff = current - start;
        const eventEnd = event.end ? new Date(new Date(event.end).getTime() + diff) : null;
        result.push({
          ...event,
          start: new Date(current),
          end: eventEnd,
          _originalId: event._id,
          _isRecurrence: true,
        });
      }
      switch (recurrence.frequency) {
        case 'daily':   current.setDate(current.getDate() + 1); break;
        case 'weekly':  current.setDate(current.getDate() + 7); break;
        case 'monthly': current.setMonth(current.getMonth() + 1); break;
        case 'yearly':  current.setFullYear(current.getFullYear() + 1); break;
        default: current.setFullYear(current.getFullYear() + 100);
      }
    }
  }
  return result;
}
