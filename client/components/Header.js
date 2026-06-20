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
    <>
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#2e2e50] bg-[#1a1a2e]/80 backdrop-blur-sm sticky top-0 z-30">
        {/* Logo + group */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={22} className="text-[#c9a96e]" />
            <span className="font-bold text-[#faf9f6] text-lg hidden sm:inline">
              Event<span className="text-[#c9a96e]">Basket</span>
            </span>
          </div>
          {/* Active group pill */}
          <button
            onClick={() => setGroupModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#222240] border border-[#2e2e50] hover:border-[#c9a96e]/40 transition-colors text-sm"
          >
            <Users size={13} className="text-[#c9a96e]" />
            <span className="text-[#faf9f6] max-w-[120px] truncate text-xs font-medium">
              {activeGroup ? activeGroup.name : t('groups.noGroups')}
            </span>
            <ChevronDown size={12} className="text-[#8888aa]" />
          </button>
        </div>

        {/* View tabs */}
        <div className="hidden md:flex items-center bg-[#222240] rounded-xl border border-[#2e2e50] p-1 gap-0.5">
          {[
            { key: 'month',  label: t('views.month') },
            { key: 'agenda', label: t('views.agenda') },
            { key: 'mine',   label: t('views.mine') },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v.key ? 'bg-[#c9a96e] text-[#1a1a2e]' : 'text-[#8888aa] hover:text-[#faf9f6]'}`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <ConnectionIndicator />
          <button onClick={toggleLang} className="p-2 rounded-lg text-[#8888aa] hover:text-[#faf9f6] hover:bg-[#222240] transition-colors" title={t('common.language')}>
            <Globe size={16} />
          </button>
          <button onClick={() => setDarkMode(d => !d)} className="p-2 rounded-lg text-[#8888aa] hover:text-[#faf9f6] hover:bg-[#222240] transition-colors">
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="w-px h-5 bg-[#2e2e50]" />
          <span className="text-xs text-[#8888aa] hidden sm:inline">{username}</span>
          <button onClick={logout} className="p-2 rounded-lg text-[#8888aa] hover:text-red-400 hover:bg-red-500/10 transition-colors" title={t('auth.logout')}>
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Mobile view tabs */}
      <div className="md:hidden flex items-center bg-[#1a1a2e] border-b border-[#2e2e50] px-4 py-2 gap-1">
        {[
          { key: 'month',  label: t('views.month') },
          { key: 'agenda', label: t('views.agenda') },
          { key: 'mine',   label: t('views.mine') },
        ].map(v => (
          <button
            key={v.key}
            onClick={() => setView(v.key)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === v.key ? 'bg-[#c9a96e] text-[#1a1a2e]' : 'text-[#8888aa]'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Group modal */}
      <Modal open={groupModal} onClose={() => setGroupModal(false)} title={t('groups.title')}>
        <GroupManager onClose={() => setGroupModal(false)} />
      </Modal>
    </>
  );
}
