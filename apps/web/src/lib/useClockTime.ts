import { useState, useEffect } from 'react';

function getTime(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function useClockTime(intervalMs = 30000): string {
  const [time, setTime] = useState(getTime());

  useEffect(() => {
    const id = setInterval(() => setTime(getTime()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return time;
}
