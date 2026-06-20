import { useState, useCallback, useEffect, useRef } from 'react';

export default function useUndo() {
  const [undoMap, setUndoMap] = useState(new Map());
  const undoMapRef = useRef(new Map());

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUndoMap(prevMap => {
        const newMap = new Map(prevMap);
        let hasChanges = false;
        for (const [id, record] of newMap.entries()) {
          if (now > record.expiresAt) {
            newMap.delete(id);
            undoMapRef.current.delete(id);
            hasChanges = true;
          }
        }
        return hasChanges ? newMap : prevMap;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const recordAction = useCallback((type, data, rollbackFn) => {
    const id = `undo-${Date.now()}`;
    const record = { id, type, data, rollback: rollbackFn, expiresAt: Date.now() + 5000 };
    setUndoMap(prev => { const m = new Map(prev); m.set(id, record); undoMapRef.current.set(id, record); return m; });
    return id;
  }, []);

  const performUndo = useCallback(async (undoId) => {
    const record = undoMapRef.current.get(undoId);
    if (!record || Date.now() > record.expiresAt) return;
    await record.rollback();
    clearUndo(undoId);
  }, []);

  const clearUndo = useCallback((undoId) => {
    setUndoMap(prev => { const m = new Map(prev); m.delete(undoId); undoMapRef.current.delete(undoId); return m; });
  }, []);

  return { recordAction, performUndo, clearUndo };
}
