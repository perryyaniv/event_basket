'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '@/context/EventsContext';
import { useApp } from '@/context/AppContext';
import { Modal } from './ui/Modal';
import { EventForm } from './EventForm';
import { EventDetail } from './EventDetail';
import { getEventType, formatDate, formatTime, expandRecurringEvents } from '@/lib/utils';
import { Calendar, MapPin, RefreshCw } from 'lucide-react';

export function AgendaView({ mineOnly = false }) {
  const { t } = useTranslation();
  const { events, fetchMyEvents } = useEvents();
  const { groups, username } = useApp();
  const [myEvents, setMyEvents] = useState([]);
  const [detailEvent, setDetailEvent] = useState(null);
  const [editEvent, setEditEvent] = useState(null);

  useEffect(() => {
    if (mineOnly && groups.length > 0) {
      fetchMyEvents(groups.map(g => g._id)).then(setMyEvents);
    }
  }, [mineOnly, groups, fetchMyEvents]);

  const now = new Date();
  const rangeEnd = new Date(now.getFullYear() + 2, 11, 31);
  const source = mineOnly ? myEvents : events;

  // Expand recurring events, then keep only the next upcoming occurrence per recurring series
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

  // Group by date
  const grouped = {};
  for (const ev of expanded) {
    const key = formatDate(ev.start);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(ev);
  }
  const dateKeys = Object.keys(grouped);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {dateKeys.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#8888aa] text-sm">
          {t('events.noEvents')}
        </div>
      ) : (
        <div className="divide-y divide-[#2e2e50]">
          {dateKeys.map(dateKey => (
            <div key={dateKey}>
              <div className="sticky top-0 bg-[#1a1a2e] px-4 py-2 border-b border-[#2e2e50] z-10">
                <span className="text-xs font-bold text-[#c9a96e] uppercase tracking-wider">{dateKey}</span>
              </div>
              <div className="divide-y divide-[#2e2e50]/50">
                {grouped[dateKey].map((ev, idx) => {
                  const et = getEventType(ev.type);
                  return (
                    <div
                      key={idx}
                      onClick={() => setDetailEvent(ev)}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-[#222240] cursor-pointer transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: `${et.color}20` }}>
                          {et.emoji}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-[#faf9f6] truncate">{ev.title}</p>
                          {ev.recurrence?.frequency !== 'once' && <RefreshCw size={10} className="text-[#8888aa] flex-shrink-0" />}
                          {mineOnly && <span className="text-xs text-[#8888aa] flex-shrink-0 truncate">({ev.groupId})</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-[#8888aa]">
                          <span>{ev.allDay ? t('events.allDay') : `${formatTime(ev.start)}${ev.end ? ` – ${formatTime(ev.end)}` : ''}`}</span>
                          {ev.location && <span className="flex items-center gap-0.5"><MapPin size={10} />{ev.location}</span>}
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-1.5 h-full self-stretch rounded-full mt-1" style={{ background: et.color, minHeight: '32px', width: '3px' }} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!detailEvent} onClose={() => setDetailEvent(null)} title={detailEvent?.title || ''}>
        <EventDetail
          event={detailEvent}
          onEdit={() => { setEditEvent(detailEvent); setDetailEvent(null); }}
          onClose={() => setDetailEvent(null)}
        />
      </Modal>
      <Modal open={!!editEvent} onClose={() => setEditEvent(null)} title={t('events.edit')} className="max-w-lg">
        <EventForm event={editEvent} onClose={() => setEditEvent(null)} />
      </Modal>
    </div>
  );
}
