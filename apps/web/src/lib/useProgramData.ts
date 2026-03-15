import { useMemo } from 'react';
import { computeProgram } from '@ironlogs/plugin-api';
import type { ComputedDay, ProgramTemplate } from '@ironlogs/plugin-api';
import { NSUNS_6DAY_DL_TEMPLATE } from '@ironlogs/plugin-nsuns';
import { ASC_MUP_TEMPLATE } from '@ironlogs/plugin-asc-mup';
import { USER_CONFIG } from '../config';

const PROGRAM_MAP: Record<string, ProgramTemplate> = {
  'nsuns-6day-dl-lp': NSUNS_6DAY_DL_TEMPLATE,
  'asc-mup': ASC_MUP_TEMPLATE,
};

interface ProgramData {
  days: ComputedDay[];
  trainingDaysPerWeek: number;
  loading: boolean;
}

export function useProgramData(): ProgramData {
  const days = useMemo(() => {
    const template = PROGRAM_MAP[USER_CONFIG.program] ?? NSUNS_6DAY_DL_TEMPLATE;
    return computeProgram(template, USER_CONFIG.trainingMaxes, USER_CONFIG.roundTo, USER_CONFIG.programStartDate);
  }, []);

  const trainingDaysPerWeek = days.filter((d) => !d.rest).length || 6;

  return { days, trainingDaysPerWeek, loading: false };
}
