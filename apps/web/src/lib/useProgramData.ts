import { useState, useEffect } from 'react';

interface ProgramData {
  days: any[];
  trainingDaysPerWeek: number;
  loading: boolean;
}

export function useProgramData(): ProgramData {
  const [data, setData] = useState<{ days: any[] } | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/nsuns-program.json`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  const days = data?.days ?? [];
  const trainingDaysPerWeek = days.filter((d: any) => !d.rest).length || 6;

  return { days, trainingDaysPerWeek, loading: !data };
}
