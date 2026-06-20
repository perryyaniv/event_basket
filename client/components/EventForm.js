'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useEvents } from '@/context/EventsContext';
import { useApp } from '@/context/AppContext';
import { Button } from './ui/Button';
import { Input, Textarea, Label } from './ui/Input';
import { EVENT_TYPES, RECURRENCE_OPTIONS } from '@/lib/utils';

const toInputDate = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';
const defaultEnd  = (start) => {
  const d = new Date(start || Date.now());
  d.setHours(d.getHours() + 1);
  return toInputDate(d);
};

export function EventForm({ event, onClose, defaultDate }) {
  const { t } = useTranslation();
  const { addEvent, updateEvent } = useEvents();
  const { showToast } = useApp();
  const isEdit = !!event;

  const initialStart = event?.start
    ? toInputDate(event.start)
    : defaultDate ? toInputDate(new Date(defaultDate)) : toInputDate(new Date());

  const [title, setTitle]     = useState(event?.title || '');
  const [type, setType]       = useState(event?.type || 'general');
  const [start, setStart]     = useState(initialStart);
  const [end, setEnd]         = useState(event?.end ? toInputDate(event.end) : defaultEnd(initialStart));
  const [desc, setDesc]       = useState(event?.description || '');
  const [loc, setLoc]         = useState(event?.location || '');
  const [freq, setFreq]       = useState(event?.recurrence?.frequency || 'once');
  const [endDate, setEndDate] = useState(event?.recurrence?.endDate ? new Date(event.recurrence.endDate).toISOString().slice(0, 10) : '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  // Birthday → default yearly
  useEffect(() => {
    if (type === 'birthday' && freq === 'once') setFreq('yearly');
  }, [type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !start) return;
    setLoading(true); setError('');
    const payload = {
      title: title.trim(),
      type,
      start: new Date(start),
      end: end ? new Date(end) : null,
      description: desc.trim(),
      location: loc.trim(),
      recurrence: { frequency: freq, endDate: endDate ? new Date(endDate) : null },
    };
    try {
      if (isEdit) {
        await updateEvent(event._id, payload);
        showToast(t('events.edit') + ' ✓');
      } else {
        await addEvent(payload);
        showToast(t('events.add') + ' ✓');
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <Label>{t('events.title')}</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('events.titlePlaceholder')} autoFocus required />
      </div>

      {/* Type */}
      <div>
        <Label>{t('events.type')}</Label>
        <div className="grid grid-cols-5 gap-1">
          {EVENT_TYPES.map(et => (
            <button
              key={et.key}
              type="button"
              onClick={() => setType(et.key)}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border transition-all ${type === et.key ? 'border-[#c9a96e] bg-[#c9a96e]/10' : 'border-[#2e2e50]'}`}
              title={t(`eventTypes.${et.key}`)}
            >
              <span className="text-sm sm:text-base leading-none">{et.emoji}</span>
              <span style={{ fontSize: '9px', color: type === et.key ? et.color : '#8888aa' }} className="truncate w-full text-center leading-tight">{t(`eventTypes.${et.key}`)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Start / End */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label>{t('events.start')}</Label>
          <Input type="datetime-local" value={start} onChange={e => setStart(e.target.value)} required />
        </div>
        <div>
          <Label>{t('events.end')}</Label>
          <Input type="datetime-local" value={end} onChange={e => setEnd(e.target.value)} />
        </div>
      </div>

      {/* Recurrence */}
      <div>
        <Label>{t('events.recurrence')}</Label>
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-1.5">
          {RECURRENCE_OPTIONS.map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setFreq(r)}
              className={`px-2 sm:px-3 py-1.5 rounded-full text-xs font-medium border transition-all text-center ${freq === r ? 'border-[#c9a96e] bg-[#c9a96e]/15 text-[#c9a96e]' : 'border-[#2e2e50] text-[#8888aa]'}`}
            >
              {t(`recurrence.${r}`)}
            </button>
          ))}
        </div>
        {freq !== 'once' && (
          <div className="mt-2">
            <Label>{t('events.endDate')}</Label>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} placeholder={t('events.noEndDate')} />
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <Label>{t('events.description')}</Label>
        <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder={t('events.descriptionPlaceholder')} rows={2} />
      </div>

      {/* Location */}
      <div>
        <Label>{t('events.location')}</Label>
        <Input value={loc} onChange={e => setLoc(e.target.value)} placeholder={t('events.locationPlaceholder')} />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex gap-2 pt-1">
        <Button variant="charcoal" size="md" type="button" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="gold" size="md" type="submit" disabled={loading || !title.trim()} className="flex-1">
          {loading ? '...' : t('common.save')}
        </Button>
      </div>
    </form>
  );
}
