'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNotification } from './NotificationContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { showNotification } = useNotification();
  const [username, setUsername]     = useState(null);
  const [pastUsers, setPastUsers]   = useState([]);
  const [groups, setGroups]         = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [darkMode, setDarkMode]     = useState(true);
  const [language, setLanguage]     = useState('he');
  const [hydrated, setHydrated]     = useState(false);

  // ── Hydrate from localStorage ──────────────────────────────────────────
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('eb_pastUsers') || '[]');
    setPastUsers(saved);
    if (saved.length > 0) setUsername(saved[0]);

    const savedGroups = JSON.parse(localStorage.getItem('eb_groups') || '[]');
    setGroups(savedGroups);

    const savedActive = localStorage.getItem('eb_activeGroup');
    if (savedActive) setActiveGroup(JSON.parse(savedActive));

    const savedDark = localStorage.getItem('eb_darkMode');
    setDarkMode(savedDark !== null ? savedDark === 'true' : true);

    const savedLang = localStorage.getItem('eb_language') || 'he';
    setLanguage(savedLang);
    setHydrated(true);
  }, []);

  // ── Persist state ──────────────────────────────────────────────────────
  useEffect(() => { localStorage.setItem('eb_pastUsers', JSON.stringify(pastUsers)); }, [pastUsers]);
  useEffect(() => { localStorage.setItem('eb_groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => {
    if (activeGroup) localStorage.setItem('eb_activeGroup', JSON.stringify(activeGroup));
    else localStorage.removeItem('eb_activeGroup');
  }, [activeGroup]);
  useEffect(() => { localStorage.setItem('eb_darkMode', String(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('eb_language', language); }, [language]);

  // ── Toast shorthand ────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success', options = {}) => {
    showNotification(message, { type, ...options });
  }, [showNotification]);

  // ── Auth ───────────────────────────────────────────────────────────────
  const login = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUsername(trimmed);
    setPastUsers(prev => [trimmed, ...prev.filter(u => u !== trimmed)].slice(0, 5));
  }, []);

  const logout = useCallback(() => {
    setUsername(null);
    setActiveGroup(null);
  }, []);

  // ── Groups ─────────────────────────────────────────────────────────────
  const createGroup = useCallback(async (name, code) => {
    const res = await axios.post(`${API}/groups`, { name, code, createdBy: username });
    const group = res.data;
    setGroups(prev => [...prev, group]);
    setActiveGroup(group);
    return group;
  }, [username]);

  const joinGroup = useCallback(async (code) => {
    const res = await axios.post(`${API}/groups/join`, { code });
    const group = res.data;
    setGroups(prev => prev.find(g => g._id === group._id) ? prev : [...prev, group]);
    setActiveGroup(group);
    return group;
  }, []);

  const leaveGroup = useCallback((groupId) => {
    setGroups(prev => prev.filter(g => g._id !== groupId));
    setActiveGroup(prev => prev?._id === groupId ? null : prev);
  }, []);

  const deleteGroup = useCallback(async (groupId) => {
    await axios.delete(`${API}/groups/${groupId}`, { data: { username } });
    leaveGroup(groupId);
  }, [username, leaveGroup]);

  const switchGroup = useCallback((group) => setActiveGroup(group), []);

  return (
    <AppContext.Provider value={{
      username, pastUsers, hydrated, login, logout,
      groups, activeGroup, createGroup, joinGroup, leaveGroup, deleteGroup, switchGroup,
      darkMode, setDarkMode,
      language, setLanguage,
      showToast,
      API,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
