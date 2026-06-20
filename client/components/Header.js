'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { Modal } from './ui/Modal';
import { GroupManager } from './GroupManager';
import { ConnectionIndicator } from './ui/ConnectionIndicator';
import { Button } from './ui/Button';
import { CalendarDays, Users, Sun, Moon, Globe, LogOut, ChevronDown, Plus } from 'lucide-react';

export function Header({ view, setView }) {
  const { t, i18n } = useTranslation();
  const { username, logout, activeGroup, darkMode, setDarkMode, language, setLanguage } = useApp();
  const [groupModal, setGroupModal] = useState(false);

  const toggleLang = () => {
    const next = language === 'he' ? 'en' : 'he';
    setLanguage(next);
    i18n.changeLanguage(next);
    document.documentElement.dir = next === 'he' ? 'rtl' : 'ltr';
  };

  return (
    <div className="sticky top-0 z-30 flex-shrink-0">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--eb-border)] bg-[var(--eb-bg)]/80 backdrop-blur-sm">
        {/* Logo + group */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-[#c9a96e]" />
            <span className="font-bold text-[var(--eb-text)] text-lg hidden sm:inline">
              Event<span className="text-[#c9a96e]">Basket</span>
            </span>
          </div>
          {/* Active group pill */}
          <button
            onClick={() => setGroupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--eb-surface)] border border-[var(--eb-border)] hover:border-[#c9a96e]/40 transition-colors text-sm"
          >
            <Users size={13} className="text-[#c9a96e]" />
            <span className="text-[var(--eb-text)] max-w-[90px] sm:max-w-[140px] truncate text-xs font-medium">
              {activeGroup ? activeGroup.name : t('groups.noGroups')}
            </span>
            <ChevronDown size={12} className="text-[var(--eb-muted)]" />
          </button>
        </div>

        {/* View tabs */}
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

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <ConnectionIndicator />
          <button onClick={toggleLang} className="p-2 rounded-lg text-[var(--eb-muted)] hover:text-[var(--eb-text)] hover:bg-[var(--eb-surface)] transition-colors" title={t('common.language')}>
            <Globe size={16} />
          </button>
          <button onClick={() => setDarkMode(d => !d)} className="p-2 rounded-lg text-[var(--eb-muted)] hover:text-[var(--eb-text)] hover:bg-[var(--eb-surface)] transition-colors">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="w-px h-5 bg-[var(--eb-border)]" />
          <span className="text-xs text-[var(--eb-muted)] hidden sm:inline">{username}</span>
          <button onClick={logout} className="p-2 rounded-lg text-[var(--eb-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors" title={t('auth.logout')}>
            <LogOut size={16} />
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

      {/* Group modal */}
      <Modal open={groupModal} onClose={() => setGroupModal(false)} title={t('groups.title')}>
        <GroupManager onClose={() => setGroupModal(false)} />
      </Modal>
    </div>
  );
}
