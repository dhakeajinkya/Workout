// Re-export scoring from @Workout/analytics
export {
  estimate1RM,
  calcLiftScore,
  calcOverallScore,
  calculateDOTS,
  calcMuscleScores,
  calcSymmetryScore,
  LIFT_RATIOS,
  LEVEL_THRESHOLDS,
  LEVELS,
  LEVEL_COLORS,
  SCORING_CATEGORIES,
  LIFT_MUSCLE_MAP,
  type Sex,
} from '@Workout/analytics';

// normalizeLiftName lives in csv-parser
export { normalizeLiftName } from '@Workout/csv-parser';
