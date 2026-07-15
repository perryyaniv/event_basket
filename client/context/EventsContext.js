'use client';
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useApp } from './AppContext';

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const { activeGroup, username, API, switchServer } = useApp();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // ── Fetch events when active group changes ─────────────────────────────
  const fetchEvents = useCallback(async () => {
    if (!activeGroup) { setEvents([]); return; }
    setLoading(true);
    try {
      const res = await axios.get(`${API}/groups/${activeGroup._id}/events`);
      setEvents(res.data);
    } finally {
      setLoading(false);
    }
  }, [activeGroup, API]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // ── Socket.IO ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!API) return;
    const socket = io(API, { reconnectionDelay: 1000, reconnectionDelayMax: 5000 });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => socket.disconnect();
  }, [API]);

  // Try fallback server after 8s of disconnect
  useEffect(() => {
    if (connected) return;
    const t = setTimeout(() => switchServer?.(), 8000);
    return () => clearTimeout(t);
  }, [connected]);

  // Join/leave socket room on group change
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (activeGroup) {
      socket.emit('join-group', activeGroup._id);
      socket.on('event-added',   (e) => setEvents(prev => [...prev, e]));
      socket.on('event-updated', (e) => setEvents(prev => prev.map(ev => ev._id === e._id ? e : ev)));
      socket.on('event-deleted', ({ _id }) => setEvents(prev => prev.filter(ev => ev._id !== _id)));
      socket.on('group-deleted', () => setEvents([]));
    }
    return () => {
      if (activeGroup) socket.emit('leave-group', activeGroup._id);
      socket.off('event-added');
      socket.off('event-updated');
      socket.off('event-deleted');
      socket.off('group-deleted');
    };
  }, [activeGroup]);

  // ── CRUD ──────────────────────────────────────────────────────────────
  const addEvent = useCallback(async (data) => {
    if (!activeGroup) return;
    const res = await axios.post(`${API}/groups/${activeGroup._id}/events`, {
      ...data, createdBy: username,
    });
    return res.data;
  }, [activeGroup, username, API]);

  const updateEvent = useCallback(async (eventId, data) => {
    if (!activeGroup) return;
    const res = await axios.patch(`${API}/groups/${activeGroup._id}/events/${eventId}`, {
      ...data, username,
    });
    return res.data;
  }, [activeGroup, username, API]);

  const deleteEvent = useCallback(async (eventId) => {
    if (!activeGroup) return;
    await axios.delete(`${API}/groups/${activeGroup._id}/events/${eventId}`, {
      data: { username },
    });
  }, [activeGroup, username, API]);

  const fetchMyEvents = useCallback(async (groupIds) => {
    const res = await axios.post(`${API}/events/mine`, { username, groupIds });
    return res.data;
  }, [username, API]);

  return (
    <EventsContext.Provider value={{ events, loading, connected, addEvent, updateEvent, deleteEvent, fetchMyEvents, refetch: fetchEvents }}>
      {children}
    </EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error('useEvents must be used inside EventsProvider');
  return ctx;
}
