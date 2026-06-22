'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '@/context/AppContext';
import { useEvents } from '@/context/EventsContext';
import { Button } from './ui/Button';
import { Input, Label } from './ui/Input';
import { Modal } from './ui/Modal';
import { Plus, UserPlus, Copy, Check, Trash2, LogOut, Eye, EyeOff } from 'lucide-react';

function GroupCard({ group, isActive, onSwitch, onLeave, onDelete, username, connected }) {
  const { t } = useTranslation();
  const [copied, setCopied]     = useState(false);
  const [codeVisible, setCodeVisible] = useState(false);
  const isCreator = group.createdBy === username;

  const revealCode = () => {
    setCodeVisible(true);
    setTimeout(() => setCodeVisible(false), 4000);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(group.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-xl border p-4 transition-all ${isActive ? 'border-[#c9a96e] bg-[#c9a96e]/5' : 'border-[var(--eb-border)] bg-[var(--eb-bg)] hover:border-[var(--eb-border)]'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isActive && <span className="w-2 h-2 rounded-full bg-[#c9a96e] flex-shrink-0" />}
            <p className="font-semibold text-[var(--eb-text)] truncate">{group.name}</p>
          </div>
          <p className="text-xs text-[var(--eb-muted)] mt-0.5">{t('groups.createdBy')}: {group.createdBy}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isCreator ? (
            <button onClick={() => onDelete(group)} disabled={!connected} className="p-1.5 rounded-lg text-[var(--eb-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title={t('groups.delete')}>
              <Trash2 size={14} />
            </button>
          ) : (
            <button onClick={() => onLeave(group)} className="p-1.5 rounded-lg text-[var(--eb-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors" title={t('groups.leave')}>
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        {isCreator ? (
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono bg-[var(--eb-border)] px-2 py-0.5 rounded text-[var(--eb-muted)] tracking-widest">
              {codeVisible ? group.code : '••••••'}
            </span>
            <button onClick={codeVisible ? copyCode : revealCode} className="p-1 rounded text-[var(--eb-muted)] hover:text-[#c9a96e] transition-colors">
              {codeVisible
                ? (copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />)
                : <Eye size={13} />}
            </button>
          </div>
        ) : (
          <span />
        )}
        {!isActive && (
          <Button variant="outline" size="sm" onClick={() => onSwitch(group)}>
            {t('groups.switchGroup')}
          </Button>
        )}
      </div>
    </div>
  );
}

export function GroupManager({ onClose }) {
  const { t } = useTranslation();
  const { username, groups, activeGroup, createGroup, joinGroup, leaveGroup, deleteGroup, switchGroup, showToast } = useApp();
  const { connected } = useEvents();
  const [mode, setMode] = useState('list'); // list | create | join
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmGroup, setConfirmGroup] = useState(null); // {group, action: 'leave'|'delete'}

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !code.trim()) return;
    setLoading(true);
    try {
      await createGroup(name.trim(), code.trim().toLowerCase());
      showToast(`${name} נוצרה בהצלחה`);
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    if (!code.trim()) return;
    setLoading(true);
    try {
      await joinGroup(code.trim().toLowerCase());
      showToast('הצטרפת לקבוצה!');
      onClose?.();
    } catch (err) {
      setError(err.response?.status === 404 ? t('groups.notFound') : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmGroup) return;
    try {
      if (confirmGroup.action === 'delete') {
        await deleteGroup(confirmGroup.group._id);
        showToast('הקבוצה נמחקה', 'info');
      } else {
        leaveGroup(confirmGroup.group._id);
        showToast('עזבת את הקבוצה', 'info');
      }
    } catch {
      showToast(t('common.error'), 'error');
    }
    setConfirmGroup(null);
  };

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      {mode === 'list' && (
        <div className="flex gap-2">
          <Button variant="gold" size="sm" className="flex-1" disabled={!connected} onClick={() => { setMode('create'); setError(''); setName(''); setCode(''); }}>
            <Plus size={15} /> {t('groups.create')}
          </Button>
          <Button variant="outline" size="sm" className="flex-1" disabled={!connected} onClick={() => { setMode('join'); setError(''); setCode(''); }}>
            <UserPlus size={15} /> {t('groups.join')}
          </Button>
        </div>
      )}

      {/* Create form */}
      {mode === 'create' && (
        <form onSubmit={handleCreate} className="space-y-3">
          <div><Label>{t('groups.groupName')}</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder={t('groups.namePlaceholder')} autoFocus /></div>
          <div><Label>{t('groups.groupCode')}</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder={t('groups.codePlaceholder')} /><p className="text-xs text-[var(--eb-muted)] mt-1">{t('groups.groupCodeHint')}</p></div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="charcoal" size="sm" type="button" onClick={() => setMode('list')}>{t('common.cancel')}</Button>
            <Button variant="gold" size="sm" type="submit" disabled={loading || !name.trim() || !code.trim()} className="flex-1">{loading ? '...' : t('groups.create')}</Button>
          </div>
        </form>
      )}

      {/* Join form */}
      {mode === 'join' && (
        <form onSubmit={handleJoin} className="space-y-3">
          <div><Label>{t('groups.groupCode')}</Label><Input value={code} onChange={e => setCode(e.target.value)} placeholder={t('groups.codePlaceholder')} autoFocus /></div>
          {error && <p className="text-red-400 text-xs">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button variant="charcoal" size="sm" type="button" onClick={() => setMode('list')}>{t('common.cancel')}</Button>
            <Button variant="gold" size="sm" type="submit" disabled={loading || !code.trim()} className="flex-1">{loading ? '...' : t('groups.join')}</Button>
          </div>
        </form>
      )}

      {/* Groups list */}
      {mode === 'list' && (
        <div className="space-y-2 max-h-[38dvh] sm:max-h-80 overflow-y-auto">
          {groups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[var(--eb-muted)] text-sm">{t('groups.noGroups')}</p>
              <p className="text-[var(--eb-muted)] text-xs mt-1">{t('groups.noGroupsHint')}</p>
            </div>
          ) : groups.map(g => (
            <GroupCard
              key={g._id}
              group={g}
              isActive={activeGroup?._id === g._id}
              onSwitch={(group) => { switchGroup(group); onClose?.(); }}
              onLeave={(group) => setConfirmGroup({ group, action: 'leave' })}
              onDelete={(group) => setConfirmGroup({ group, action: 'delete' })}
              username={username}
              connected={connected}
            />
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      {confirmGroup && (
        <Modal open={true} onClose={() => setConfirmGroup(null)} title={confirmGroup.action === 'delete' ? t('groups.delete') : t('groups.leave')}>
          <p className="text-[var(--eb-text)] text-sm mb-5">
            {confirmGroup.action === 'delete' ? t('groups.deleteConfirm') : t('groups.leaveConfirm')}
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="charcoal" size="sm" onClick={() => setConfirmGroup(null)}>{t('common.cancel')}</Button>
            <Button variant="destructive" size="sm" onClick={handleConfirm}>{t('common.confirm')}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
