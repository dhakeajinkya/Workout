import { useMemo } from 'react';
import { groupByDay } from './useLifts';
import type { LiftEntry } from './types';

interface LifetimeStats {
  sessionCount: number;
  totalTonnage: number;
  currentStreak: number;
  bestStreak: number;
}

export function useLifetimeStats(entries: LiftEntry[]): LifetimeStats {
  return useMemo(() => {
    const sessions = groupByDay(entries);
    const totalTonnage = sessions.reduce((sum, s) => sum + s.tonnage, 0);

    let currentStreak = 0;
    let bestStreak = 0;
    if (sessions.length > 0) {
      const dates = sessions.map((s) => s.date).sort().reverse();
      currentStreak = 1;
      for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1] + 'T00:00:00');
        const curr = new Date(dates[i] + 'T00:00:00');
        const gap = (prev.getTime() - curr.getTime()) / 86400000;
        if (gap <= 2) { currentStreak++; } else { break; }
      }
      let streak = 1;
      const sortedDates = [...dates].reverse();
      for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i - 1] + 'T00:00:00');
        const curr = new Date(sortedDates[i] + 'T00:00:00');
        const gap = (curr.getTime() - prev.getTime()) / 86400000;
        if (gap <= 2) { streak++; } else { streak = 1; }
        if (streak > bestStreak) bestStreak = streak;
      }
      if (currentStreak > bestStreak) bestStreak = currentStreak;
    }

    return {
      sessionCount: sessions.length,
      totalTonnage: Math.round(totalTonnage / 1000 * 10) / 10,
      currentStreak,
      bestStreak,
    };
  }, [entries]);
}
