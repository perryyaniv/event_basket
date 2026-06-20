'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { CalendarDays } from 'lucide-react';

export function LoginScreen() {
  const { login, pastUsers } = useApp();
  const { t } = useTranslation();
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) login(name.trim());
  };

  return (
    <div className="min-h-screen bg-[var(--eb-bg)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Gold glow background */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c9a96e]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center mb-4">
            <CalendarDays size={32} className="text-[#c9a96e]" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Event<span className="text-[#c9a96e]">Basket</span>
          </h1>
          <p className="text-[var(--eb-muted)] text-sm mt-1">{t('app.tagline')}</p>
        </div>

        {/* Form */}
        <div className="bg-[var(--eb-surface)] border border-[var(--eb-border)] rounded-2xl p-6">
          <p className="text-[var(--eb-text)] font-semibold mb-4">{t('auth.enterName')}</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('auth.namePlaceholder')}
              autoFocus
            />
            <Button variant="gold" size="lg" className="w-full" type="submit" disabled={!name.trim()}>
              {t('auth.continue')}
            </Button>
          </form>

          {/* Past users */}
          {pastUsers.length > 1 && (
            <div className="mt-5 pt-5 border-t border-[var(--eb-border)]">
              <p className="text-xs text-[var(--eb-muted)] uppercase tracking-wider mb-3">{t('auth.previousUsers')}</p>
              <div className="flex flex-wrap gap-2">
                {pastUsers.slice(1).map(u => (
                  <button
                    key={u}
                    onClick={() => login(u)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-[var(--eb-bg)] border border-[var(--eb-border)] text-[var(--eb-text)] hover:border-[#c9a96e] transition-colors"
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
