'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '@/context/EventsContext';
import { useApp } from '@/context/AppContext';
import { Modal } from './ui/Modal';
import { EventForm } from './EventForm';
import { EventDetail } from './EventDetail';
import { EVENT_TYPES, getEventType, formatDate, formatTime, expandRecurringEvents } from '@/lib/utils';
import { Calendar, MapPin, RefreshCw, Search, X } from 'lucide-react';

export function AgendaView({ mineOnly = false }) {
  const { t } = useTranslation();
  const { events, fetchMyEvents } = useEvents();
  const { groups, username } = useApp();
  const [myEvents, setMyEvents]       = useState([]);
  const [detailEvent, setDetailEvent] = useState(null);
  const [editEvent, setEditEvent]     = useState(null);
  const [search, setSearch]           = useState('');
  const [typeFilter, setTypeFilter]   = useState(null); // null = all

  useEffect(() => {
    if (mineOnly && groups.length > 0) {
      fetchMyEvents(groups.map(g => g._id)).then(setMyEvents);
    }
  }, [mineOnly, groups, fetchMyEvents]);

  const now = new Date();
  const rangeEnd = new Date(now.getFullYear() + 2, 11, 31);
  const source = mineOnly ? myEvents : events;

  // Expand + dedupe recurring
  const allExpanded = expandRecurringEvents(source, now, rangeEnd)
    .filter(e => new Date(e.end || e.start) >= now)
    .sort((a, b) => new Date(a.start) - new Date(b.start));

  const seenRecurring = new Set();
  const expanded = allExpanded.filter(e => {
    if (!e._isRecurrence) return true;
    const id = String(e._originalId);
    if (seenRecurring.has(id)) return false;
    seenRecurring.add(id);
    return true;
  });

  // Search + type filter
  const q = search.trim().toLowerCase();
  const filtered = expanded.filter(e => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (q && !e.title.toLowerCase().includes(q) && !e.description?.toLowerCase().includes(q) && !e.location?.toLowerCase().includes(q)) return false;
    return true;
  });

  // Group by date
  const grouped = {};
  for (const ev of filtered) {
    const key = formatDate(ev.start);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  }
  const dateKeys = Object.keys(grouped);
  const hasFilters = !!q || !!typeFilter;

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Search + filter bar */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-[var(--eb-border)] space-y-2">
        {/* Search input */}
        <div className="relative">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 text-[var(--eb-muted)]" style={{ insetInlineStart: '10px' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('common.search', 'חיפוש...')}
            className="w-full h-9 rounded-lg bg-[var(--eb-bg)] border border-[var(--eb-border)] text-[var(--eb-text)] text-sm placeholder:text-[var(--eb-muted)] focus:outline-none focus:border-[#c9a96e] transition-colors"
            style={{ paddingInlineStart: '30px', paddingInlineEnd: search ? '30px' : '10px' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute top-1/2 -translate-y-1/2 text-[var(--eb-muted)] hover:text-[var(--eb-text)]" style={{ insetInlineEnd: '8px' }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide">
          <button
            onClick={() => setTypeFilter(null)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-all ${!typeFilter ? 'bg-[#c9a96e] text-[var(--eb-bg)] border-[#c9a96e]' : 'border-[var(--eb-border)] text-[var(--eb-muted)]'}`}
          >
            {t('common.all', 'הכל')}
          </button>
          {EVENT_TYPES.map(et => (
            <button
              key={et.key}
              onClick={() => setTypeFilter(typeFilter === et.key ? null : et.key)}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${typeFilter === et.key ? 'border-transparent text-white' : 'border-[var(--eb-border)] text-[var(--eb-muted)]'}`}
              style={typeFilter === et.key ? { background: et.color } : {}}
            >
              <span>{et.emoji}</span>
              <span>{t(`eventTypes.${et.key}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {dateKeys.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-16 text-[var(--eb-muted)] text-sm">
            {hasFilters ? t('common.noResults', 'אין תוצאות') : t('events.noEvents')}
          </div>
        ) : (
          <div className="divide-y divide-[var(--eb-border)]">
            {dateKeys.map(dateKey => (
              <div key={dateKey}>
                <div className="sticky top-0 bg-[var(--eb-bg)] px-4 py-2 border-b border-[var(--eb-border)] z-10">
                  <span className="text-xs font-bold text-[#c9a96e] uppercase tracking-wider">{dateKey}</span>
                </div>
                <div className="divide-y divide-[var(--eb-border)]/50">
                  {grouped[dateKey].map((ev, idx) => {
                    const et = getEventType(ev.type);
                    return (
                      <div
                        key={idx}
                        onClick={() => setDetailEvent(ev)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-[var(--eb-surface)] cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: `${et.color}20` }}>
                            {et.emoji}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-[var(--eb-text)] truncate">{ev.title}</p>
                            {ev.recurrence?.frequency !== 'once' && <RefreshCw size={10} className="text-[var(--eb-muted)] flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-[var(--eb-muted)]">
                            <span dir="ltr">{ev.allDay ? t('events.allDay') : `${formatTime(ev.start)}${ev.end ? ` – ${formatTime(ev.end)}` : ''}`}</span>
                            {ev.location && <span className="flex items-center gap-0.5"><MapPin size={10} />{ev.location}</span>}
                          </div>
                        </div>
                        <div className="flex-shrink-0 rounded-full mt-1" style={{ background: et.color, minHeight: '32px', width: '3px' }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={!!detailEvent} onClose={() => setDetailEvent(null)} title={detailEvent?.title || ''}>
        <EventDetail
          event={detailEvent}
          onEdit={() => { setEditEvent(detailEvent); setDetailEvent(null); }}
          onClose={() => setDetailEvent(null)}
        />
      </Modal>
      <Modal open={!!editEvent} onClose={() => setEditEvent(null)} title={t('events.edit')} className="max-w-lg">
        <EventForm key={editEvent?._id} event={editEvent} onClose={() => setEditEvent(null)} />
      </Modal>
    </div>
  );
}
