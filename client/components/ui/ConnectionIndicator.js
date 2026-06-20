'use client';
import { useTranslation } from 'react-i18next';
import useConnectionStatus from '@/hooks/useConnectionStatus';

export function ConnectionIndicator() {
  const { t } = useTranslation();
  const status = useConnectionStatus();
  const connected = status === 'connected';

  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full transition-colors ${
        status === 'checking'      ? 'bg-yellow-400' :
        connected                  ? 'bg-green-400 animate-pulse' :
                                     'bg-red-400'
      }`} />
      <span className="text-xs text-[#8888aa] hidden sm:inline">
        {connected ? t('common.connected') : t('common.disconnected')}
      </span>
    </div>
  );
}
