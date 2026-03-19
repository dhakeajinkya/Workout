import type { LiftEntry } from '@Workout/core';

/** Metric computed by a plugin */
export interface PluginMetric {
  id: string;
  name: string;
  description: string;
  compute: (entries: LiftEntry[]) => number | string | null;
}

/** Chart/visualization provided by a plugin */
export interface PluginChart {
  id: string;
  name: string;
  description: string;
  /** React component name or render function */
  component: string;
}

/** Achievement added by a plugin */
export interface PluginAchievement {
  id: string;
  title: string;
  description: string;
  category: string;
  check: (entries: LiftEntry[]) => boolean;
}

/** Computed program (absolute weights — what consumers use) */
export interface ComputedSet {
  weight: number;
  reps: number | string;
}

export interface ComputedLift {
  lift: string;
  sets: ComputedSet[];
}

export interface ComputedDay {
  name: string;
  label: string;
  rest?: boolean;
  t1?: ComputedLift;
  t2?: ComputedLift;
  accessories?: string[];
}

/** Program template (percentage-based, defined by plugins) */
export interface TemplateSet {
  /** Percentage of training max (e.g., 0.65 = 65%) */
  pct: number;
  reps: number | string;
}

export interface TemplateLift {
  /** The actual lift performed (e.g., "cgbench", "front_squat") */
  lift: string;
  /** Which training max to use (e.g., "bench" for CG bench) */
  tmLift: string;
  sets: TemplateSet[];
}

export interface TemplateDay {
  name: string;
  label: string;
  rest?: boolean;
  t1?: TemplateLift;
  t2?: TemplateLift;
  accessories?: string[];
}

/** A training block within a periodized program */
export interface TrainingBlock {
  id: string;
  name: string;
  /** Phase label (e.g., 'accumulation', 'intensification', 'realization') */
  phase: string;
  /** Duration in weeks */
  weeks: number;
  /** Weekly template for this block */
  days: TemplateDay[];
}

export interface ProgramTemplate {
  id: string;
  name: string;
  description?: string;
  /** Factor to derive TM from 1RM (e.g., 0.9 for nSuns) */
  tmFactor: number;
  /** Lifts that have training maxes */
  tmLifts: string[];
  /** Weekly template (used when there are no blocks) */
  days: TemplateDay[];
  /** Optional periodized block structure. When present, the active block's
   *  days are used instead of the top-level `days` array. */
  blocks?: TrainingBlock[];
  /** How blocks cycle: 'once' runs linearly then stops, 'repeat' loops.
   *  Defaults to 'once'. Only meaningful when `blocks` is set. */
  cycle?: 'once' | 'repeat';
}

/** Training maxes keyed by lift name */
export type TrainingMaxes = Record<string, number>;

/** Round to nearest multiple (MROUND equivalent) */
export function mround(value: number, multiple: number): number {
  if (multiple === 0) return value;
  return Math.round(value / multiple) * multiple;
}

/** Compute absolute weight from TM, percentage, and rounding factor */
export function computeWeight(tm: number, pct: number, roundTo: number): number {
  return mround(tm * pct, roundTo);
}

/**
 * Resolve which training block is active for a periodized program.
 * Returns null for non-periodized programs or if the program has ended (non-repeating).
 */
export function getActiveBlock(
  template: ProgramTemplate,
  startDate: string,
  today?: string,
): { block: TrainingBlock; weekInBlock: number; blockIndex: number } | null {
  if (!template.blocks || template.blocks.length === 0) return null;

  const start = new Date(startDate + 'T00:00:00');
  const now = today ? new Date(today + 'T00:00:00') : new Date();
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / 86400000);
  if (daysSinceStart < 0) return null;

  const weeksSinceStart = Math.floor(daysSinceStart / 7);
  const totalWeeks = template.blocks.reduce((sum, b) => sum + b.weeks, 0);

  let effectiveWeek = weeksSinceStart;
  if (template.cycle === 'repeat' && totalWeeks > 0) {
    effectiveWeek = weeksSinceStart % totalWeeks;
  } else if (weeksSinceStart >= totalWeeks) {
    return null; // program ended
  }

  let accumulated = 0;
  for (let i = 0; i < template.blocks.length; i++) {
    const block = template.blocks[i];
    if (effectiveWeek < accumulated + block.weeks) {
      return { block, weekInBlock: effectiveWeek - accumulated + 1, blockIndex: i };
    }
    accumulated += block.weeks;
  }
  return null;
}

/**
 * Compute a full program with absolute weights from a template + training maxes.
 * If startDate is provided and the template has blocks, uses the active block's days.
 */
export function computeProgram(
  template: ProgramTemplate,
  tms: TrainingMaxes,
  roundTo: number,
  startDate?: string,
): ComputedDay[] {
  let templateDays = template.days;

  if (startDate && template.blocks) {
    const active = getActiveBlock(template, startDate);
    if (active) templateDays = active.block.days;
  }

  return templateDays.map((day) => {
    if (day.rest) {
      return { name: day.name, label: day.label, rest: true };
    }

    const result: ComputedDay = {
      name: day.name,
      label: day.label,
      accessories: day.accessories,
    };

    if (day.t1) {
      const tm = tms[day.t1.tmLift] ?? 0;
      result.t1 = {
        lift: day.t1.lift,
        sets: day.t1.sets.map((s) => ({
          weight: computeWeight(tm, s.pct, roundTo),
          reps: s.reps,
        })),
      };
    }

    if (day.t2) {
      const tm = tms[day.t2.tmLift] ?? 0;
      result.t2 = {
        lift: day.t2.lift,
        sets: day.t2.sets.map((s) => ({
          weight: computeWeight(tm, s.pct, roundTo),
          reps: s.reps,
        })),
      };
    }

    return result;
  });
}

/** CSV importer */
export interface PluginImporter {
  name: string;
  description: string;
  /** File extensions this importer handles */
  extensions: string[];
  parse: (text: string) => LiftEntry[];
}

/** Current plugin API version. Plugins declare the API version they target. */
export const PLUGIN_API_VERSION = 1;

/** The main plugin interface */
export interface WorkoutPlugin {
  name: string;
  version: string;
  /** Target API version for forward compatibility checks */
  apiVersion?: number;
  description?: string;

  /** Additional metrics */
  metrics?: PluginMetric[];

  /** Additional charts/visualizations */
  charts?: PluginChart[];

  /** Additional achievements */
  achievements?: PluginAchievement[];

  /** Program templates (percentage-based) */
  programs?: ProgramTemplate[];

  /** CSV importers */
  importers?: PluginImporter[];
}

/** Plugin registry */
const plugins = new Map<string, WorkoutPlugin>();

export function registerPlugin(plugin: WorkoutPlugin): void {
  if (plugin.apiVersion && plugin.apiVersion > PLUGIN_API_VERSION) {
    console.warn(
      `Plugin "${plugin.name}" targets API v${plugin.apiVersion} but runtime is v${PLUGIN_API_VERSION}. ` +
      `Some features may not work.`,
    );
  }
  plugins.set(plugin.name, plugin);
}

export function getPlugin(name: string): WorkoutPlugin | undefined {
  return plugins.get(name);
}

export function getAllPlugins(): WorkoutPlugin[] {
  return Array.from(plugins.values());
}

export function getPluginAchievements(): PluginAchievement[] {
  return getAllPlugins().flatMap((p) => p.achievements || []);
}

export function getPluginPrograms(): ProgramTemplate[] {
  return getAllPlugins().flatMap((p) => p.programs || []);
}

export function getPluginImporters(): PluginImporter[] {
  return getAllPlugins().flatMap((p) => p.importers || []);
}
