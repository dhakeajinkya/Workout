import { useState, useMemo } from 'react';
import { useLifts } from '../lib/useLifts';
import { normalizeLiftName } from '../lib/scoring';
import { computeProgram } from '@Workout/plugin-api';
import type { ComputedDay, ComputedLift, ProgramTemplate } from '@Workout/plugin-api';
import { getNextDayIndex } from '../lib/programDetection';
import { getLiftLabel, getLiftColor } from '../lib/liftMeta';
import { USER_CONFIG } from '../config';
import { NSUNS_6DAY_DL_TEMPLATE } from '@Workout/plugin-nsuns';
import { ASC_MUP_TEMPLATE } from '@Workout/plugin-asc-mup';

const PROGRAM_MAP: Record<string, ProgramTemplate> = {
  'nsuns-6day-dl-lp': NSUNS_6DAY_DL_TEMPLATE,
  'asc-mup': ASC_MUP_TEMPLATE,
};

const TM_STEP = 2.5;

function LiftBlock({ lift, tier }: { lift: ComputedLift; tier: 'T1' | 'T2' }) {
  const name = normalizeLiftName(lift.lift);
  const color = getLiftColor(name);
  const label = getLiftLabel(name, true);
  const isT2 = tier === 'T2';

  return (
    <div className="mb-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>{tier}</span>
        <span className={`text-sm font-semibold ${isT2 ? 'opacity-80' : ''}`} style={{ color }}>{label}</span>
      </div>
      <div className="flex gap-1 flex-wrap">
        {lift.sets.map((s, i) => {
          const isAmrap = typeof s.reps === 'string' && String(s.reps).includes('+');
          return (
            <span
              key={i}
              className={`px-2 py-1 rounded text-xs tabular-nums ${isAmrap ? 'font-bold' : ''}`}
              style={{
                backgroundColor: isAmrap ? color + '25' : isT2 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
                color: isAmrap ? color : isT2 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.8)',
                border: isAmrap ? `1px solid ${color}50` : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {s.weight}×{s.reps}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function DayCard({ day, index, isToday, isRest }: { day: ComputedDay; index: number; isToday: boolean; isRest: boolean }) {
  const dayLabel = `D${index + 1}`;

  if (isRest) {
    return (
      <div
        className="rounded-lg p-3 flex items-center gap-3"
        style={{
          backgroundColor: isToday ? 'rgba(77,208,225,0.08)' : 'rgba(255,255,255,0.02)',
          border: isToday ? '1.5px solid rgba(77,208,225,0.4)' : '1px solid rgba(255,255,255,0.06)',
          minHeight: 60,
        }}
      >
        <div className="text-center" style={{ minWidth: 32 }}>
          <div className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>{dayLabel}</div>
        </div>
        <div className="text-sm italic" style={{ color: 'rgba(255,255,255,0.3)' }}>Rest Day</div>
        {isToday && <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(77,208,225,0.15)', color: '#4dd0e1' }}>today</span>}
      </div>
    );
  }

  return (
    <div
      className="rounded-lg p-3"
      style={{
        backgroundColor: isToday ? 'rgba(121,134,203,0.10)' : 'rgba(255,255,255,0.02)',
        border: isToday ? '1.5px solid rgba(121,134,203,0.4)' : '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-center shrink-0" style={{ minWidth: 32 }}>
          <div className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.45)' }}>{dayLabel}</div>
          {isToday && (
            <span className="inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(121,134,203,0.2)', color: '#7986cb' }}>
              today
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold mb-2" style={{ color: isToday ? '#c5cae9' : 'rgba(255,255,255,0.75)' }}>
            {day.label}
          </div>
          {day.t1 && <LiftBlock lift={day.t1} tier="T1" />}
          {day.t2 && <LiftBlock lift={day.t2} tier="T2" />}
          {day.accessories && day.accessories.length > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>ACC</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{day.accessories.join(' · ')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TMCard({ lift, tm, isModified, onUp, onDown }: {
  lift: string; tm: number; isModified: boolean;
  onUp: () => void; onDown: () => void;
}) {
  const color = getLiftColor(lift);
  return (
    <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: color + '15', border: `1px solid ${color}25` }}>
      <div className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>{getLiftLabel(lift, true)} TM{isModified && <span style={{ color }}>*</span>}</div>
      <div className="flex items-center gap-2">
        <button
          onClick={onDown}
          className="border-none bg-transparent cursor-pointer p-1 rounded"
          style={{ color, fontSize: 18, lineHeight: 1 }}
          aria-label={`Decrease ${lift} TM`}
        >&#9664;</button>
        <span className="text-xl font-bold tabular-nums" style={{ color, minWidth: 65, textAlign: 'center' }}>
          {tm.toFixed(1)} <span className="text-xs font-normal" style={{ color: 'rgba(255,255,255,0.5)' }}>kg</span>
        </span>
        <button
          onClick={onUp}
          className="border-none bg-transparent cursor-pointer p-1 rounded"
          style={{ color, fontSize: 18, lineHeight: 1 }}
          aria-label={`Increase ${lift} TM`}
        >&#9654;</button>
      </div>
    </div>
  );
}

export default function Program() {
  const { entries, loading } = useLifts();
  const [tmOverrides, setTmOverrides] = useState<Record<string, number>>({});

  const baseTMs: Record<string, number> = USER_CONFIG.trainingMaxes;
  const effectiveTMs = useMemo(() => {
    const merged = { ...baseTMs };
    for (const [lift, val] of Object.entries(tmOverrides)) {
      merged[lift] = val;
    }
    return merged;
  }, [baseTMs, tmOverrides]);

  const hasOverrides = Object.keys(tmOverrides).length > 0;

  const template = PROGRAM_MAP[USER_CONFIG.program] ?? NSUNS_6DAY_DL_TEMPLATE;
  const days = useMemo(
    () => computeProgram(template, effectiveTMs, USER_CONFIG.roundTo, USER_CONFIG.programStartDate),
    [template, effectiveTMs],
  );

  if (loading) return <p className="text-text-muted">Loading...</p>;

  const nextDayIndex = getNextDayIndex(days, entries);

  const adjustTM = (lift: string, delta: number) => {
    setTmOverrides((prev) => {
      const current = prev[lift] ?? baseTMs[lift] ?? 0;
      const next = current + delta;
      // If back to original, remove override
      if (next === baseTMs[lift]) {
        const { [lift]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [lift]: next };
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="mb-0">{template.name}</h2>
        {hasOverrides && (
          <button
            onClick={() => setTmOverrides({})}
            className="text-xs px-2 py-1 rounded border-none cursor-pointer"
            style={{ backgroundColor: 'rgba(239,83,80,0.15)', color: '#ef5350' }}
          >
            Reset TMs
          </button>
        )}
      </div>

      {/* Training Maxes */}
      <div className="grid grid-cols-2 sm:flex gap-3 mb-5 sm:flex-wrap">
        {Object.entries(baseTMs).map(([lift]) => (
          <TMCard
            key={lift}
            lift={lift}
            tm={effectiveTMs[lift]}
            isModified={lift in tmOverrides}
            onUp={() => adjustTM(lift, TM_STEP)}
            onDown={() => adjustTM(lift, -TM_STEP)}
          />
        ))}
      </div>

      {/* Weekly schedule */}
      <div className="flex flex-col gap-2">
        {days.map((day, i) => (
          <DayCard
            key={i}
            day={day}
            index={i}
            isToday={i === nextDayIndex}
            isRest={!!day.rest}
          />
        ))}
      </div>
    </div>
  );
}
