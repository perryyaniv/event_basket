'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { AppMenu } from './AppMenu';
import { ConnectionIndicator } from './ui/ConnectionIndicator';
import { Modal } from './ui/Modal';
import { CalendarDays, Sun, Moon, Globe, Menu } from 'lucide-react';

export function Header({ view, setView }) {
  const { t, i18n } = useTranslation();
  const { darkMode, setDarkMode, language, setLanguage } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
    const next = language === 'he' ? 'en' : 'he';
    setLanguage(next);
    i18n.changeLanguage(next);
    document.documentElement.dir  = next === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  return (
    <div className="sticky top-0 z-30 flex-shrink-0">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--eb-border)] bg-[var(--eb-bg)]/90 backdrop-blur-sm">

        {/* App name — inline-start (RIGHT in Hebrew, LEFT in English) */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <CalendarDays size={22} className="text-[#c9a96e]" />
          <span className="font-bold text-[var(--eb-text)] text-lg tracking-tight">
            Event<span className="text-[#c9a96e]">Basket</span>
          </span>
        </div>

        {/* Desktop view tabs — center */}
        <div className="hidden md:flex items-center bg-[var(--eb-surface)] rounded-xl border border-[var(--eb-border)] p-1 gap-0.5">
          {[
            { key: 'month',  label: t('views.month') },
            { key: 'agenda', label: t('views.agenda') },
            { key: 'mine',   label: t('views.mine') },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v.key ? 'bg-[#c9a96e] text-[var(--eb-bg)]' : 'text-[var(--eb-muted)] hover:text-[var(--eb-text)]'}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Controls — inline-end (LEFT in Hebrew, RIGHT in English) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <ConnectionIndicator />
          <button onClick={toggleLang} className="p-2 rounded-lg text-[var(--eb-muted)] hover:text-[var(--eb-text)] hover:bg-[var(--eb-surface)] transition-colors">
            <Globe size={16} />
          </button>
          <button onClick={() => setDarkMode(d => !d)} className="p-2 rounded-lg text-[var(--eb-muted)] hover:text-[var(--eb-text)] hover:bg-[var(--eb-surface)] transition-colors">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMenuOpen(true)}
            className="p-2 rounded-lg text-[var(--eb-muted)] hover:text-[var(--eb-text)] hover:bg-[var(--eb-surface)] transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Mobile view tabs */}
      <div className="md:hidden flex items-center bg-[var(--eb-bg)] border-b border-[var(--eb-border)] px-4 py-2 gap-1">
        {[
          { key: 'month',  label: t('views.month') },
          { key: 'agenda', label: t('views.agenda') },
          { key: 'mine',   label: t('views.mine') },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v.key ? 'bg-[#c9a96e] text-[var(--eb-bg)]' : 'text-[var(--eb-muted)]'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <AppMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
