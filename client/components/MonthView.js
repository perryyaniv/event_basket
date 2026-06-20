'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '@/context/EventsContext';
import { useApp } from '@/context/AppContext';
import { Modal } from './ui/Modal';
import { EventForm } from './EventForm';
import { EventDetail } from './EventDetail';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getCalendarDays, isToday, isSameDay, expandRecurringEvents, getEventType } from '@/lib/utils';

export function MonthView() {
  const { t } = useTranslation();
  const { events } = useEvents();
  const { activeGroup, username } = useApp();
  const [year, setYear]               = useState(new Date().getFullYear());
  const [month, setMonth]             = useState(new Date().getMonth());
  const [addModal, setAddModal]       = useState(null);  // date | null
  const [detailEvent, setDetailEvent] = useState(null);
  const [editEvent, setEditEvent]     = useState(null);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const rangeStart = new Date(year, month, 1);
  const rangeEnd   = new Date(year, month + 1, 0, 23, 59, 59);
  const expanded   = expandRecurringEvents(events, rangeStart, rangeEnd);
  const days       = getCalendarDays(year, month);

  const eventsOnDay = (date) => expanded.filter(e => isSameDay(e.start, date)).sort((a, b) => new Date(a.start) - new Date(b.start));

  const monthNames = t('calendar.months', { returnObjects: true });
  const dayNames   = t('calendar.days',   { returnObjects: true });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2e2e50]">
        <button onClick={prevMonth} className="p-2 rounded-lg text-[#8888aa] hover:text-[#faf9f6] hover:bg-[#222240] transition-colors">
          <ChevronRight size={18} />
        </button>
        <h2 className="text-lg font-bold text-[#faf9f6]">
          {monthNames[month]} {year}
        </h2>
        <button onClick={nextMonth} className="p-2 rounded-lg text-[#8888aa] hover:text-[#faf9f6] hover:bg-[#222240] transition-colors">
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-[#2e2e50]">
        {dayNames.map((d, i) => (
          <div key={i} className="py-2 text-center text-xs font-semibold text-[#8888aa] uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 flex-1 auto-rows-[minmax(80px,1fr)]">
        {days.map(({ date, currentMonth }, i) => {
          const dayEvents = eventsOnDay(date);
          const today = isToday(date);
          return (
            <div
              key={i}
              onClick={() => currentMonth && setAddModal(date)}
              className={`border-r border-b border-[#2e2e50] p-1 cursor-pointer transition-colors overflow-hidden
                ${currentMonth ? 'hover:bg-[#222240]/60' : 'opacity-30'}
                ${today ? 'bg-[#c9a96e]/5' : ''}`}
            >
              <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1
                ${today ? 'bg-[#c9a96e] text-[#1a1a2e]' : 'text-[#8888aa]'}`}>
                {date.getDate()}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev, idx) => {
                  const et = getEventType(ev.type);
                  return (
                    <div
                      key={idx}
                      onClick={e => { e.stopPropagation(); setDetailEvent(ev); }}
                      className="flex items-center gap-1 px-1 py-0.5 rounded text-xs truncate cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ background: `${et.color}20`, borderLeft: `2px solid ${et.color}` }}
                    >
                      <span className="truncate text-[#faf9f6]">{ev.title}</span>
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-[#8888aa] px-1">+{dayEvents.length - 3}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add event modal */}
      <Modal open={!!addModal} onClose={() => setAddModal(null)} title={t('events.add')}>
        <EventForm defaultDate={addModal} onClose={() => setAddModal(null)} />
      </Modal>

      {/* Event detail modal */}
      <Modal open={!!detailEvent} onClose={() => setDetailEvent(null)} title={detailEvent?.title || ''}>
        <EventDetail
          event={detailEvent}
          onEdit={() => { setEditEvent(detailEvent); setDetailEvent(null); }}
          onClose={() => setDetailEvent(null)}
        />
      </Modal>

      {/* Edit event modal */}
      <Modal open={!!editEvent} onClose={() => setEditEvent(null)} title={t('events.edit')} className="max-w-lg">
        <EventForm event={editEvent} onClose={() => setEditEvent(null)} />
      </Modal>
    </div>
  );
}
