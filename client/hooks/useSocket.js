'use client';
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(serverUrl) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!serverUrl) return;
    const socket = io(serverUrl, { reconnectionDelay: 1000, reconnectionDelayMax: 5000 });
    socketRef.current = socket;
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    return () => socket.disconnect();
  }, [serverUrl]);

  return { socket: socketRef.current, connected };
}
