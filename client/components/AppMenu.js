'use client';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { GroupManager } from './GroupManager';
import { LogOut, X, User, Sun, Moon, Globe } from 'lucide-react';

export function AppMenu({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const { username, logout, darkMode, setDarkMode, language, setLanguage } = useApp();

  if (!open) return null;

  const handleLogout = () => { logout(); onClose(); };

  const toggleLang = () => {
    const next = language === 'he' ? 'en' : 'he';
    setLanguage(next);
    i18n.changeLanguage(next);
    document.documentElement.dir  = next === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = next;
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative ms-auto w-80 max-w-[90vw] h-full bg-[var(--eb-surface)] border-s border-[var(--eb-border)] flex flex-col shadow-2xl animate-fade-in">

        {/* User header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--eb-border)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#c9a96e]/15 border border-[#c9a96e]/30 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-[#c9a96e]" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--eb-text)]">{username}</p>
              <p className="text-xs text-[var(--eb-muted)]">{t('app.tagline')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--eb-muted)] hover:text-[var(--eb-text)] hover:bg-[var(--eb-border)] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Settings row */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--eb-border)]">
          {/* Dark / Light mode */}
          <button
            onClick={() => setDarkMode(d => !d)}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--eb-border)] hover:bg-[var(--eb-border)] transition-colors text-sm text-[var(--eb-text)]"
          >
            {darkMode ? <Sun size={15} className="text-[#c9a96e]" /> : <Moon size={15} className="text-[#c9a96e]" />}
            <span className="text-xs">{darkMode ? t('common.lightMode') : t('common.darkMode')}</span>
          </button>

          {/* Language */}
          <button
            onClick={toggleLang}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--eb-border)] hover:bg-[var(--eb-border)] transition-colors text-sm text-[var(--eb-text)]"
          >
            <Globe size={15} className="text-[#c9a96e]" />
            <span className="text-xs">{language === 'he' ? 'English' : 'עברית'}</span>
          </button>
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <p className="text-xs font-bold text-[var(--eb-muted)] uppercase tracking-wider mb-3">{t('groups.title')}</p>
          <GroupManager onClose={onClose} />
        </div>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-[var(--eb-border)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-colors"
          >
            <LogOut size={16} />
            {t('auth.logout')}
          </button>
        </div>
      </div>
    </div>
  );
}
