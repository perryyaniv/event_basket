'use client';
import { useTranslation } from 'react-i18next';
import { useEvents } from '@/context/EventsContext';
import { useApp } from '@/context/AppContext';
import { Button } from './ui/Button';
import { getEventType, formatDate, formatTime } from '@/lib/utils';
import { MapPin, Calendar, RefreshCw, User, Clock } from 'lucide-react';

export function EventDetail({ event, onEdit, onClose }) {
  const { t } = useTranslation();
  const { deleteEvent, connected } = useEvents();
  const { username, showToast } = useApp();
  if (!event) return null;

  const et = getEventType(event.type);
  const isCreator = event.createdBy === username;

  const handleDelete = async () => {
    try {
      await deleteEvent(event._id);
      showToast(t('events.delete') + ' ✓', 'info');
      onClose();
    } catch {
      showToast(t('common.error'), 'error');
    }
  };

  return (
    <div className="space-y-4">
      {/* Type badge */}
      <div className="flex items-center gap-2">
        <span className="text-2xl">{et.emoji}</span>
        <span className="text-sm font-medium px-2 py-0.5 rounded-full" style={{ background: `${et.color}20`, color: et.color }}>
          {t(`eventTypes.${event.type}`)}
        </span>
      </div>

      {/* Info rows */}
      <div className="space-y-2 text-sm text-[var(--eb-text)]">
        <div className="flex items-center gap-2 text-[var(--eb-muted)]">
          <Calendar size={14} />
          <span>{formatDate(event.start)}</span>
        </div>
        <div className="flex items-center gap-2 text-[var(--eb-muted)]">
          <Clock size={14} />
          <span dir="ltr">{event.allDay ? t('events.allDay') : `${formatTime(event.start)}${event.end ? ` – ${formatTime(event.end)}` : ''}`}</span>
        </div>
        {event.location && (
          <div className="flex items-center gap-2 text-[var(--eb-muted)]">
            <MapPin size={14} />
            <span>{event.location}</span>
          </div>
        )}
        {event.recurrence?.frequency !== 'once' && (
          <div className="flex items-center gap-2 text-[var(--eb-muted)]">
            <RefreshCw size={14} />
            <span>{t(`recurrence.${event.recurrence.frequency}`)}</span>
          </div>
        )}
        {event.description && (
          <p className="text-[var(--eb-text)] bg-[var(--eb-bg)] rounded-lg p-3 text-sm leading-relaxed">{event.description}</p>
        )}
        <div className="flex items-center gap-2 text-[var(--eb-muted)]">
          <User size={14} />
          <span>{event.createdBy}</span>
        </div>
      </div>

      {/* Actions (creator only) */}
      {isCreator && (
        <div className="flex flex-col gap-2 pt-2 border-t border-[var(--eb-border)]">
          {!connected && (
            <p className="text-xs text-center text-[var(--eb-muted)]">{t('common.disconnected')} — {t('common.readOnly', 'צפייה בלבד')}</p>
          )}
          <div className="flex gap-2">
            <Button variant="charcoal" size="sm" onClick={onEdit} disabled={!connected} className="flex-1">{t('common.edit')}</Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} disabled={!connected} className="flex-1">{t('common.delete')}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
