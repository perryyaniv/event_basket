'use client';
import { useTranslation } from 'react-i18next';
import { useEvents } from '@/context/EventsContext';

export function ConnectionIndicator() {
  const { t } = useTranslation();
  const { connected } = useEvents();

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full transition-colors ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
      <span className="text-xs text-[var(--eb-muted)] hidden sm:inline">
        {connected ? t('common.connected') : t('common.disconnected')}
      </span>
    </div>
  );
}
