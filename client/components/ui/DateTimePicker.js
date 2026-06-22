'use client';
import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { he, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// ── helpers ───────────────────────────────────────────────────────────────────
function pad(n) { return String(n).padStart(2, '0'); }

function formatDisplay(date, allDay, lang) {
  if (!date) return '';
  const locale = lang === 'he' ? 'he-IL' : 'en-US';
  if (allDay) return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  return date.toLocaleString(locale, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// ── styles passed to DayPicker ────────────────────────────────────────────────
const dp = {
  root:          'w-full',
  months:        'flex flex-col',
  month:         'w-full',
  caption:       'flex items-center justify-between px-1 pb-2',
  caption_label: 'text-sm font-bold text-[var(--eb-text)]',
  nav:           'flex items-center gap-1',
  nav_button:    'p-1.5 rounded-lg text-[var(--eb-muted)] hover:text-[var(--eb-text)] hover:bg-[var(--eb-border)] transition-colors',
  nav_button_previous: '',
  nav_button_next:     '',
  table:         'w-full border-collapse',
  head_row:      'flex w-full',
  head_cell:     'flex-1 text-center text-[10px] font-semibold text-[var(--eb-muted)] uppercase py-1',
  row:           'flex w-full mt-1',
  cell:          'flex-1 text-center',
  day:           'w-full aspect-square max-w-[36px] mx-auto flex items-center justify-center rounded-lg text-sm transition-colors hover:bg-[var(--eb-border)] text-[var(--eb-text)] cursor-pointer',
  day_selected:  '!bg-[#c9a96e] !text-[var(--eb-bg)] font-bold hover:!bg-[#d4ba85]',
  day_today:     'font-bold ring-1 ring-[#c9a96e]/50',
  day_outside:   'opacity-0 pointer-events-none',
  day_disabled:  'opacity-30 cursor-not-allowed',
};

// ── component ─────────────────────────────────────────────────────────────────
export function DateTimePicker({ value, onChange, allDay = false, label, placeholder }) {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isRtl = lang === 'he';

  const [open, setOpen]     = useState(false);
  const [month, setMonth]   = useState(value || new Date());
  const [hours, setHours]   = useState(value ? pad(value.getHours()) : '09');
  const [mins, setMins]     = useState(value ? pad(value.getMinutes()) : '00');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleDaySelect = (day) => {
    if (!day) return;
    const next = new Date(day);
    if (!allDay) {
      next.setHours(parseInt(hours, 10));
      next.setMinutes(parseInt(mins, 10));
    }
    onChange(next);
    if (allDay) setOpen(false);
  };

  const handleTimeChange = (h, m) => {
    if (!value) return;
    const next = new Date(value);
    next.setHours(parseInt(h, 10) || 0);
    next.setMinutes(parseInt(m, 10) || 0);
    onChange(next);
  };

  const locale = lang === 'he' ? he : enUS;

  return (
    <div ref={ref} className="relative">
      {/* Trigger input */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 px-3 rounded-lg text-sm bg-[var(--eb-bg)] border border-[var(--eb-border)] text-[var(--eb-text)] focus:outline-none focus:ring-2 focus:ring-[#c9a96e]/50 focus:border-[#c9a96e] transition-colors flex items-center gap-2"
      >
        <Calendar size={14} className="text-[var(--eb-muted)] flex-shrink-0" />
        <span className={`flex-1 text-start truncate ${!value ? 'text-[var(--eb-muted)]' : ''}`}>
          {value ? formatDisplay(value, allDay, lang) : (placeholder || '')}
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute z-50 mt-1 bg-[var(--eb-surface)] border border-[var(--eb-border)] rounded-xl shadow-2xl p-3 w-72"
          style={{ [isRtl ? 'right' : 'left']: 0 }}>
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleDaySelect}
            month={month}
            onMonthChange={setMonth}
            locale={locale}
            dir={isRtl ? 'rtl' : 'ltr'}
            classNames={dp}
            components={{
              IconLeft:  () => <ChevronRight size={14} />,
              IconRight: () => <ChevronLeft size={14} />,
            }}
          />

          {/* Time picker */}
          {!allDay && (
            <div className="mt-2 pt-2 border-t border-[var(--eb-border)] flex items-center gap-2">
              <Clock size={14} className="text-[var(--eb-muted)] flex-shrink-0" />
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="number" min="0" max="23"
                  value={hours}
                  onChange={e => { setHours(e.target.value); handleTimeChange(e.target.value, mins); }}
                  className="w-12 text-center h-8 rounded-lg bg-[var(--eb-bg)] border border-[var(--eb-border)] text-[var(--eb-text)] text-sm focus:outline-none focus:border-[#c9a96e]"
                />
                <span className="text-[var(--eb-muted)] font-bold">:</span>
                <input
                  type="number" min="0" max="59"
                  value={mins}
                  onChange={e => { setMins(e.target.value); handleTimeChange(hours, e.target.value); }}
                  className="w-12 text-center h-8 rounded-lg bg-[var(--eb-bg)] border border-[var(--eb-border)] text-[var(--eb-text)] text-sm focus:outline-none focus:border-[#c9a96e]"
                />
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-1 rounded-lg bg-[#c9a96e] text-[var(--eb-bg)] text-xs font-bold hover:bg-[#d4ba85] transition-colors"
              >
                ✓
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
