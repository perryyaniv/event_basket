import { useState, useEffect } from 'react';
import axios from 'axios';

export default function useConnectionStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        setStatus('connected');
        return response;
      },
      (error) => {
        if (error.code === 'ERR_NETWORK' || !error.response) {
          setStatus('disconnected');
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(responseInterceptor);
  }, []);

  return status;
}
