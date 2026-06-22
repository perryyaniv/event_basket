'use client';
'use client';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { Modal } from './ui/Modal';
import { GroupManager } from './GroupManager';
import { ConnectionIndicator } from './ui/ConnectionIndicator';
import { Button } from './ui/Button';
import { CalendarDays, Users, Sun, Moon, Globe, LogOut, ChevronDown, User } from 'lucide-react';

export function Header({ view, setView }) {
  const { t, i18n } = useTranslation();
  const { username, logout, activeGroup, darkMode, setDarkMode, language, setLanguage } = useApp();
  const [groupModal, setGroupModal] = useState(false);
  const [userMenu, setUserMenu]     = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenu) return;
    const handler = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userMenu]);

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
            <span className="font-bold text-[var(--eb-text)] text-lg">
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
          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setUserMenu(v => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[var(--eb-surface)] transition-colors"
            >
              <User size={14} className="text-[var(--eb-muted)]" />
              <span className="text-xs text-[var(--eb-text)] font-medium max-w-[80px] truncate">{username}</span>
              <ChevronDown size={12} className="text-[var(--eb-muted)]" />
            </button>
            {userMenu && (
              <div className="absolute end-0 top-full mt-1 w-36 bg-[var(--eb-surface)] border border-[var(--eb-border)] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <button
                  onClick={() => { logout(); setUserMenu(false); }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={14} />
                  {t('auth.logout')}
                </button>
              </div>
            )}
          </div>
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
