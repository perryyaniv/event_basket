'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { EventsProvider } from '@/context/EventsContext';
import { LoginScreen } from './LoginScreen';
import { Header } from './Header';
import { MonthView } from './MonthView';
import { AgendaView } from './AgendaView';
import { ToastContainer } from './ui/Toast';
import { ProgressBar } from './ui/ProgressBar';
import { Modal } from './ui/Modal';
import { EventForm } from './EventForm';
import { Button } from './ui/Button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function CalendarApp() {
  const { t } = useTranslation();
  const { activeGroup } = useApp();
  const [view, setView] = useState('month');
  const [addModal, setAddModal] = useState(false);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[var(--eb-bg)] text-[var(--eb-text)]">
      <Header view={view} setView={setView} />

      {/* No group selected state */}
      {!activeGroup ? (
        <div className="flex-1 flex items-center justify-center text-center px-6">
          <div>
            <p className="text-[var(--eb-muted)] text-lg mb-1">{t('groups.noGroups')}</p>
            <p className="text-[var(--eb-muted)] text-sm">{t('groups.noGroupsHint')}</p>
          </div>
        </div>
      ) : (
        <main className="flex-1 overflow-hidden relative">
          {view === 'month'  && <MonthView />}
          {view === 'agenda' && <AgendaView />}
          {view === 'mine'   && <AgendaView mineOnly />}

          {/* FAB */}
          <button
            onClick={() => setAddModal(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#c9a96e] text-[var(--eb-bg)] shadow-xl hover:bg-[#d4ba85] active:scale-95 transition-all flex items-center justify-center z-20"
            title={t('events.add')}
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </main>
      )}

      {/* Add event modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={t('events.add')} className="max-w-lg">
        <EventForm onClose={() => setAddModal(false)} />
      </Modal>

      <ProgressBar />
      <ToastContainer />
    </div>
  );
}

export function AppShell() {
  const { username, hydrated } = useApp();
  if (!hydrated) return (
    <div className="min-h-screen bg-[var(--eb-bg)] flex items-center justify-center">
      <div className="w-2 h-2 rounded-full bg-[#c9a96e] animate-pulse" />
    </div>
  );
  if (!username) return <LoginScreen />;
  return (
    <EventsProvider>
      <CalendarApp />
    </EventsProvider>
  );
}
