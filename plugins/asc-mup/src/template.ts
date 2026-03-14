/**
 * Australian Strength Coach — Monthly Undulating Periodisation (MUP)
 *
 * 16-week macro cycle: 4 blocks × 4 weeks each.
 * Alternates accumulation (volume) and intensification (heavy) phases.
 *
 * Block 1: Accumulation  — sets of 10, 65-75% TM, variations
 * Block 2: Intensification — sets of 4, 80-88% TM, competition lifts
 * Block 3: Accumulation  — sets of 8, 70-80% TM, variations
 * Block 4: Realisation   — sets of 2, 88-95% TM, competition lifts
 *
 * Based on ASC's periodisation content:
 * - "Periodisation Explained Simply"
 * - "Undulating Periodisation for Strength"
 *
 * 3-day upper/lower/full split per block. Exercise selection changes
 * between accumulation (variations) and intensification (competition).
 */

import type { ProgramTemplate, TemplateDay } from '@ironlogs/plugin-api';

// ─── Block 1: Accumulation 10s ──────────────────────────────

const ACCUM_10S: TemplateDay[] = [
  {
    name: 'Day 1',
    label: 'Upper (10s)',
    t1: {
      lift: 'pause_bench',
      tmLift: 'bench',
      sets: [
        { pct: 0.60, reps: 10 },
        { pct: 0.65, reps: 10 },
        { pct: 0.65, reps: 10 },
        { pct: 0.65, reps: 10 },
      ],
    },
    t2: {
      lift: 'db_ohp',
      tmLift: 'ohp',
      sets: [
        { pct: 0.55, reps: 10 },
        { pct: 0.55, reps: 10 },
        { pct: 0.55, reps: 10 },
      ],
    },
    accessories: ['Face Pulls', 'Lat Pulldown', 'Tricep Pushdown'],
  },
  {
    name: 'Day 2',
    label: 'Lower (10s)',
    t1: {
      lift: 'front_squat',
      tmLift: 'squat',
      sets: [
        { pct: 0.55, reps: 10 },
        { pct: 0.60, reps: 10 },
        { pct: 0.60, reps: 10 },
        { pct: 0.60, reps: 10 },
      ],
    },
    t2: {
      lift: 'rdl',
      tmLift: 'deadlift',
      sets: [
        { pct: 0.50, reps: 10 },
        { pct: 0.50, reps: 10 },
        { pct: 0.50, reps: 10 },
      ],
    },
    accessories: ['Leg Press', 'Leg Curl', 'Calf Raises'],
  },
  {
    name: 'Day 3',
    label: 'Full Body (10s)',
    t1: {
      lift: 'ohp',
      tmLift: 'ohp',
      sets: [
        { pct: 0.60, reps: 10 },
        { pct: 0.65, reps: 10 },
        { pct: 0.65, reps: 10 },
      ],
    },
    t2: {
      lift: 'front_squat',
      tmLift: 'squat',
      sets: [
        { pct: 0.55, reps: 10 },
        { pct: 0.55, reps: 10 },
        { pct: 0.55, reps: 10 },
      ],
    },
    accessories: ['Rows', 'Face Pulls'],
  },
  { name: 'Day 4', label: 'Rest', rest: true },
];

// ─── Block 2: Intensification 4s ────────────────────────────

const INTENS_4S: TemplateDay[] = [
  {
    name: 'Day 1',
    label: 'Upper (4s)',
    t1: {
      lift: 'bench',
      tmLift: 'bench',
      sets: [
        { pct: 0.75, reps: 4 },
        { pct: 0.80, reps: 4 },
        { pct: 0.85, reps: 4 },
        { pct: 0.85, reps: 4 },
        { pct: 0.88, reps: 4 },
      ],
    },
    t2: {
      lift: 'ohp',
      tmLift: 'ohp',
      sets: [
        { pct: 0.70, reps: 4 },
        { pct: 0.70, reps: 4 },
        { pct: 0.70, reps: 4 },
      ],
    },
    accessories: ['Face Pulls', 'Rows'],
  },
  {
    name: 'Day 2',
    label: 'Lower (4s)',
    t1: {
      lift: 'squat',
      tmLift: 'squat',
      sets: [
        { pct: 0.75, reps: 4 },
        { pct: 0.80, reps: 4 },
        { pct: 0.85, reps: 4 },
        { pct: 0.85, reps: 4 },
        { pct: 0.88, reps: 4 },
      ],
    },
    t2: {
      lift: 'deadlift',
      tmLift: 'deadlift',
      sets: [
        { pct: 0.70, reps: 4 },
        { pct: 0.75, reps: 4 },
        { pct: 0.75, reps: 4 },
      ],
    },
    accessories: ['Leg Press', 'Leg Curl'],
  },
  {
    name: 'Day 3',
    label: 'Full Body (4s)',
    t1: {
      lift: 'deadlift',
      tmLift: 'deadlift',
      sets: [
        { pct: 0.80, reps: 4 },
        { pct: 0.85, reps: 4 },
        { pct: 0.85, reps: 4 },
        { pct: 0.88, reps: 4 },
      ],
    },
    t2: {
      lift: 'bench',
      tmLift: 'bench',
      sets: [
        { pct: 0.70, reps: 4 },
        { pct: 0.70, reps: 4 },
        { pct: 0.70, reps: 4 },
      ],
    },
    accessories: ['Rows', 'Face Pulls'],
  },
  { name: 'Day 4', label: 'Rest', rest: true },
];

// ─── Block 3: Accumulation 8s ───────────────────────────────

const ACCUM_8S: TemplateDay[] = [
  {
    name: 'Day 1',
    label: 'Upper (8s)',
    t1: {
      lift: 'pause_bench',
      tmLift: 'bench',
      sets: [
        { pct: 0.65, reps: 8 },
        { pct: 0.70, reps: 8 },
        { pct: 0.75, reps: 8 },
        { pct: 0.75, reps: 8 },
      ],
    },
    t2: {
      lift: 'db_ohp',
      tmLift: 'ohp',
      sets: [
        { pct: 0.60, reps: 8 },
        { pct: 0.60, reps: 8 },
        { pct: 0.60, reps: 8 },
      ],
    },
    accessories: ['Face Pulls', 'Lat Pulldown', 'Tricep Pushdown'],
  },
  {
    name: 'Day 2',
    label: 'Lower (8s)',
    t1: {
      lift: 'front_squat',
      tmLift: 'squat',
      sets: [
        { pct: 0.60, reps: 8 },
        { pct: 0.65, reps: 8 },
        { pct: 0.70, reps: 8 },
        { pct: 0.70, reps: 8 },
      ],
    },
    t2: {
      lift: 'rdl',
      tmLift: 'deadlift',
      sets: [
        { pct: 0.55, reps: 8 },
        { pct: 0.55, reps: 8 },
        { pct: 0.55, reps: 8 },
      ],
    },
    accessories: ['Leg Press', 'Leg Curl', 'Calf Raises'],
  },
  {
    name: 'Day 3',
    label: 'Full Body (8s)',
    t1: {
      lift: 'ohp',
      tmLift: 'ohp',
      sets: [
        { pct: 0.65, reps: 8 },
        { pct: 0.70, reps: 8 },
        { pct: 0.70, reps: 8 },
      ],
    },
    t2: {
      lift: 'front_squat',
      tmLift: 'squat',
      sets: [
        { pct: 0.60, reps: 8 },
        { pct: 0.60, reps: 8 },
        { pct: 0.60, reps: 8 },
      ],
    },
    accessories: ['Rows', 'Face Pulls'],
  },
  { name: 'Day 4', label: 'Rest', rest: true },
];

// ─── Block 4: Realisation 2s ────────────────────────────────

const REAL_2S: TemplateDay[] = [
  {
    name: 'Day 1',
    label: 'Upper (2s)',
    t1: {
      lift: 'bench',
      tmLift: 'bench',
      sets: [
        { pct: 0.85, reps: 2 },
        { pct: 0.88, reps: 2 },
        { pct: 0.92, reps: 2 },
        { pct: 0.95, reps: 2 },
        { pct: 0.88, reps: 2 },
      ],
    },
    t2: {
      lift: 'ohp',
      tmLift: 'ohp',
      sets: [
        { pct: 0.80, reps: 2 },
        { pct: 0.80, reps: 2 },
        { pct: 0.80, reps: 2 },
      ],
    },
    accessories: ['Face Pulls'],
  },
  {
    name: 'Day 2',
    label: 'Lower (2s)',
    t1: {
      lift: 'squat',
      tmLift: 'squat',
      sets: [
        { pct: 0.85, reps: 2 },
        { pct: 0.88, reps: 2 },
        { pct: 0.92, reps: 2 },
        { pct: 0.95, reps: 2 },
        { pct: 0.88, reps: 2 },
      ],
    },
    t2: {
      lift: 'deadlift',
      tmLift: 'deadlift',
      sets: [
        { pct: 0.80, reps: 2 },
        { pct: 0.85, reps: 2 },
        { pct: 0.85, reps: 2 },
      ],
    },
    accessories: ['Leg Curl'],
  },
  {
    name: 'Day 3',
    label: 'Full Body (2s)',
    t1: {
      lift: 'deadlift',
      tmLift: 'deadlift',
      sets: [
        { pct: 0.88, reps: 2 },
        { pct: 0.92, reps: 2 },
        { pct: 0.95, reps: 2 },
        { pct: 0.88, reps: 2 },
      ],
    },
    t2: {
      lift: 'bench',
      tmLift: 'bench',
      sets: [
        { pct: 0.80, reps: 2 },
        { pct: 0.80, reps: 2 },
        { pct: 0.80, reps: 2 },
      ],
    },
    accessories: ['Rows'],
  },
  { name: 'Day 4', label: 'Rest', rest: true },
];

// ─── Program Template ───────────────────────────────────────

export const ASC_MUP_TEMPLATE: ProgramTemplate = {
  id: 'asc-mup',
  name: 'ASC Monthly Undulating Periodisation',
  description:
    '16-week macro cycle: Accumulation (10s) → Intensification (4s) → ' +
    'Accumulation (8s) → Realisation (2s). 3 training days per block week. ' +
    'Based on Australian Strength Coach methodology.',
  tmFactor: 0.9,
  tmLifts: ['squat', 'bench', 'deadlift', 'ohp'],
  // Flat days fallback (block 1 used as default when no start date)
  days: ACCUM_10S,
  cycle: 'repeat',
  blocks: [
    { id: 'accum-10s', name: 'Accumulation (10s)', phase: 'accumulation', weeks: 4, days: ACCUM_10S },
    { id: 'intens-4s', name: 'Intensification (4s)', phase: 'intensification', weeks: 4, days: INTENS_4S },
    { id: 'accum-8s', name: 'Accumulation (8s)', phase: 'accumulation', weeks: 4, days: ACCUM_8S },
    { id: 'real-2s', name: 'Realisation (2s)', phase: 'realisation', weeks: 4, days: REAL_2S },
  ],
};
