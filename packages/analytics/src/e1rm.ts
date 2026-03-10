/** Maximum reps for reliable 1RM estimation. Sets above this are hypertrophy work. */
export const MAX_REPS_FOR_1RM = 12;

/**
 * Estimate one-rep max using the Wathan formula.
 *
 * Uses the exponential model from Wathan, D. (1994). *Essentials of Strength
 * Training and Conditioning*, NSCA. Most accurate for 1-10 reps; accuracy
 * degrades beyond 10 reps due to increasing endurance influence.
 *
 * Sets above {@link MAX_REPS_FOR_1RM} (12) return 0 — high-rep sets produce
 * unreliable 1RM estimates because endurance becomes the limiting factor.
 *
 * @param weight - Weight lifted (any unit, returned in same unit)
 * @param reps - Number of repetitions performed
 * @returns Estimated 1RM rounded to one decimal place, or 0 for invalid inputs or reps > 12
 */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps > MAX_REPS_FOR_1RM) return 0;
  if (reps === 1) return weight;
  return Math.round((100 * weight) / (48.8 + 53.8 * Math.exp(-0.075 * reps)) * 10) / 10;
}
