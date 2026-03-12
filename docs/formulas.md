# IronLogs Mathematical Formulas

Reference documentation for every formula used in the IronLogs scoring, fatigue, and gamification systems.

---

## 1. One-Rep Max (1RM) Estimation

**Source:** `packages/analytics/src/e1rm.ts`

Uses the Wathan exponential model.

```
e1RM = (100 * weight) / (48.8 + 53.8 * e^(-0.075 * reps))
```

- **Rep cap:** Sets with reps > 12 return 0 (high-rep sets produce unreliable estimates because endurance becomes the limiting factor).
- **Identity case:** If reps = 1, e1RM = weight (no estimation needed).
- **Invalid inputs:** weight <= 0 or reps <= 0 return 0.
- Result is rounded to one decimal place.

**Citation:** Wathan, D. (1994). *Essentials of Strength Training and Conditioning*, Chapter 17. National Strength and Conditioning Association (NSCA). Champaign, IL: Human Kinetics.

---

## 2. DOTS Score

**Source:** `packages/analytics/src/scoring.ts`

The official IPF bodyweight-normalization formula adopted in 2019, replacing Wilks for competition rankings.

```
DOTS = 500 * Total / (a + b*BW + c*BW^2 + d*BW^3 + e*BW^4)
```

Equivalently: `DOTS = Total * dotsCoefficient(BW)` where `dotsCoefficient = 500 / denominator`.

### Coefficients

| Coefficient | Male             | Female           |
|-------------|------------------|------------------|
| a           | -307.75076       | -57.96288        |
| b           | 24.0900756       | 13.6175032       |
| c           | -0.1918759221    | -0.1126655495    |
| d           | 0.0007391293     | 0.0005158568     |
| e           | -0.0000010930    | -0.0000010706    |

### Bodyweight Clamping

The polynomial is validated for the range **40 kg to 210 kg**. Bodyweight values outside this range are clamped to the nearest bound before evaluation.

If the denominator evaluates to <= 0, the coefficient returns 0 (guards against numerical instability at extreme bodyweights).

**Citation:** Haleczko, A. (2019). *DOTS — a new formula for comparing the results across different bodyweight categories.* International Powerlifting Federation. Verified against thecalcs.com and strengthinumbrs.com calculators.

---

## 3. Wilks Score (Legacy)

**Source:** `packages/analytics/src/scoring.ts`

A 5th-degree polynomial normalization formula, historically used for powerlifting comparisons before DOTS.

```
Wilks = 500 * Total / (a + b*BW + c*BW^2 + d*BW^3 + e*BW^4 + f*BW^5)
```

### Coefficients

| Coefficient | Male             | Female              |
|-------------|------------------|---------------------|
| a           | -216.0475144     | 594.31747775582     |
| b           | 16.2606339       | -27.23842536447     |
| c           | -0.002388645     | 0.82112226871       |
| d           | -0.00113732      | -0.00930733913      |
| e           | 0.00000701863    | 0.00004731582       |
| f           | -0.000000001291  | -0.00000009054      |

Same guarding logic as DOTS: denominator <= 0 returns 0.

**Citation:** Wilks, R. *Wilks Formula.* https://en.wikipedia.org/wiki/Wilks_coefficient

---

## 4. Scoring Pipeline

**Source:** `packages/analytics/src/scoring.ts` — `singleLiftScore()`

The pipeline converts a single lift's 1RM into a normalized 0-125+ strength score:

```
1. estimatedTotal = e1RM / liftRatio
2. rawPoints      = estimatedTotal * formulaCoefficient(BW, sex)
3. ageAdjusted    = rawPoints * ageAdjustment(age)
4. score          = ageAdjusted / formulaScaling
```

### Step 1 — Estimated Powerlifting Total

Each lift has a known ratio representing what fraction of a full powerlifting total (squat + bench + deadlift) it typically constitutes. Dividing the lift's e1RM by its ratio projects an estimated total.

**Lift Ratios (male / female):**

| Lift           | Male   | Female |
|----------------|--------|--------|
| Deadlift       | 0.3968 | 0.3750 |
| Squat          | 0.3452 | 0.3500 |
| Bench          | 0.2579 | 0.2800 |
| Sumo Deadlift  | 0.3968 | 0.3750 |
| Front Squat    | 0.2762 | 0.2800 |
| Incline Bench  | 0.2115 | 0.2300 |
| OHP            | 0.1676 | 0.1800 |
| Push Press     | 0.2229 | 0.2400 |
| Snatch Press   | 0.1341 | 0.1450 |
| Pendlay Row    | 0.2103 | 0.2200 |
| Power Clean    | 0.2222 | 0.2350 |
| Close-Grip Bench | 0.2321 | 0.2520 |

Male ratios derived from competitive powerlifting data. Female ratios adjusted per coaching recommendation.

### Step 2 — Bodyweight Normalization

The estimated total is multiplied by the DOTS or Wilks coefficient (see sections 2 and 3) to produce bodyweight-normalized points.

### Step 3 — Age Adjustment

See section 5 below.

### Step 4 — Formula Scaling

Raw normalized points (typically 200-500 for competitive lifters) are divided by a formula-specific constant to map onto the 0-125 level scale:

| Formula | Scaling Divisor |
|---------|-----------------|
| DOTS    | 4.3             |
| Wilks   | 4.0             |

These are calibrated at an ~83 kg male reference bodyweight so that both formulas produce equivalent level classifications. The DOTS divisor satisfies: `dotsCoeff(83) / (wilksCoeff(83) / 4) = 4.3`.

### Overall Score

For the overall score (`calcOverallScore`), lifts are grouped into five scoring categories:

- **Squat:** squat, front_squat
- **Floor Pull:** deadlift, sumo_deadlift, power_clean
- **Horizontal Press:** bench, incline_bench
- **Vertical Press:** ohp, push_press, snatch_press
- **Pull/Row:** chinup, pullup, pendlay_row

The best score within each category is selected, then the average across populated categories is taken.

---

## 5. Age Adjustment

**Source:** `packages/analytics/src/scoring.ts` — `ageAdjustment()`

Applies a multiplier to compensate for age-related strength differences. No adjustment for ages 23-40 (prime lifting years).

```
age < 23:   adjustment = 0.0039 * age^2 - 0.167 * age + 2.80
23 <= age <= 40: adjustment = 1.0
age > 40:   adjustment = 0.000468 * age^2 - 0.0300 * age + 1.45
```

**Junior curve (age < 23):** A downward-opening quadratic that produces values > 1, boosting scores for younger lifters who haven't reached physical maturity. At age 18 the adjustment is approximately 1.26; it approaches 1.0 as age nears 23.

**Masters curve (age > 40):** An upward-opening quadratic that produces values > 1, compensating for age-related strength decline. At age 50 the adjustment is approximately 1.32; at age 60 approximately 1.93.

---

## 6. Level Thresholds

**Source:** `packages/analytics/src/scoring.ts` — `LEVEL_THRESHOLDS`

Scores from the pipeline (section 4) map onto a 0-125+ scale with the following classification:

| Minimum Score | Level         |
|---------------|---------------|
| 125           | World Class   |
| 112.5         | Elite         |
| 100           | Exceptional   |
| 87.5          | Advanced      |
| 75            | Proficient    |
| 60            | Intermediate  |
| 45            | Novice        |
| 30            | Untrained     |
| 0             | Subpar        |

The first threshold met (scanning from highest to lowest) determines the level. Scores above 125 are possible and still classify as World Class.

---

## 7. EWMA Fatigue (ACWR)

**Source:** `packages/analytics/src/fatigue.ts`

Uses Exponentially Weighted Moving Averages to compute the Acute:Chronic Workload Ratio.

### EWMA Update Rule

```
EWMA_t = load_t * lambda + (1 - lambda) * EWMA_{t-1}
```

Applied daily (rest days have load = 0).

### Lambda Values

| Window  | Days | Lambda          |
|---------|------|-----------------|
| Acute   | 7    | 2 / (7 + 1) = 0.25  |
| Chronic | 28   | 2 / (28 + 1) ~= 0.069 |

Lambda is the standard EWMA smoothing factor: `lambda = 2 / (N + 1)`.

### ACWR

```
ACWR = acute_EWMA / chronic_EWMA
```

Requires at least **21 days** of data for a meaningful chronic estimate. Returns null if chronic EWMA is 0 or insufficient data.

### Classification Zones

| ACWR Range | Status              | Interpretation             |
|------------|---------------------|----------------------------|
| < 0.8      | Detraining          | Insufficient stimulus      |
| 0.8 - 1.2  | Optimal             | Sweet spot for adaptation  |
| 1.2 - 1.4  | Elevated Fatigue    | Monitor closely            |
| > 1.4      | Deload Recommended  | Injury/overtraining risk   |

Thresholds are tighter than field sports literature, calibrated for strength sports.

### Per-Lift Fatigue

For individual lifts, load is intensity-weighted rather than raw tonnage:

```
load_set = weight * reps * intensity
intensity = clamp(weight / e1RM, 0.3, 1.2)
```

This weights heavy sets higher than light sets at equal tonnage, better reflecting neural fatigue (e.g., 100x5x5 produces more fatigue than 60x20x5 despite similar tonnage).

Lift variants are grouped: bench includes incline_bench and cgbench; squat includes front_squat; deadlift includes sumo_deadlift.

### Fatigue Reserve

```
reserve = (chronic_EWMA - acute_EWMA) / 1000    (in tonnes)
```

- Positive: fresh reserve (chronic exceeds acute)
- 0 to -1: slightly overreaching
- < -1: overreaching

**Citation:** Williams, S., et al. (2016). *Better way to determine the acute:chronic workload ratio.* British Journal of Sports Medicine. Also: Gabbett, T.J. (2016). *The training-injury prevention paradox.* BJSM.

---

## 8. Muscle Scoring

**Source:** `packages/analytics/src/muscles.ts`

### Involvement Matrix

Each lift has a per-muscle involvement score on a 0-10 scale (0 = not involved, 10 = prime mover). The full matrix covers 22 muscle groups across 13 lifts.

### Cubic Weighting

Muscle scores are computed as a weighted average of lift scores, where the weight is the cube of the involvement value:

```
muscle_score = sum(lift_score_i * involvement_i^3) / sum(involvement_i^3)
```

Cubing the involvement values strongly favors prime movers over secondary muscles. A muscle with involvement 10 contributes 1000x the weight of involvement 1. A muscle with involvement 5 contributes 125x the weight of involvement 1.

The result is only emitted if the sum of cubed involvements meets a minimum threshold of 50; otherwise the muscle gets a score of 0.

Each muscle score is then classified using the same level thresholds from section 6.

### Symmetry Score

```
symmetry = max(0, 100 - variance)
```

Where variance is the population variance of all muscle scores:

```
variance = sum((score_i - mean)^2) / N
```

A perfect symmetry score of 100 means all muscle scores are identical. The score decreases as disparity between muscle groups increases.

---

## 9. Readiness Score

**Source:** `packages/analytics/src/trends.ts` — `calcReadiness()`

A composite 0-100 score estimating training readiness from three components:

```
readiness = (0.50 * sleepComponent + 0.30 * fatigueComponent + 0.20 * amrapComponent) * 100
```

Capped at 100.

### Sleep Component (50% weight)

```
sleepComponent = min(7-day average sleep hours / 8.0, 1.25)
```

Normalized to an 8-hour target. Capped at 125% (sleeping >10 hours doesn't infinitely boost readiness). Defaults to 0.5 if no sleep data.

### Fatigue Component (30% weight)

Uses an internal EWMA calculation (lambda_acute = 0.25, lambda_chronic = 2/29) to compute ACWR, then maps it:

```
ACWR 0.8 - 1.3:   fatigueComponent = 1.0        (optimal zone)
ACWR < 0.8:        fatigueComponent = max(0.3, ACWR / 0.8)
ACWR > 1.3:        fatigueComponent = max(0.2, 1.0 - (ACWR - 1.3) * 2)
```

Defaults to 0.7 if fewer than 21 days of data.

### AMRAP Component (20% weight)

Based on recent AMRAP surplus (actual reps minus programmed minimum) from the last 7 AMRAP sets:

```
amrapComponent = clamp((avgSurplus + 2) / 8, 0, 1)
```

An average surplus of 6 gives a full 1.0. An average surplus of -2 gives 0. Defaults to 0.5 if fewer than 2 recent AMRAP sets.

### Classification

| Score Range | Label     |
|-------------|-----------|
| >= 80       | Fresh     |
| >= 60       | Good      |
| >= 40       | Moderate  |
| < 40        | Fatigued  |

---

## 10. XP Curve

**Source:** `packages/gamification/src/xp.ts`

### Level-Up Requirement

```
XP_required(level) = round(80 * level^1.5)
```

The base constant of 80 is tuned for slightly faster early progression at 3-6 sessions per week.

Example values:

| Level | XP Required |
|-------|-------------|
| 1     | 80          |
| 2     | 226         |
| 5     | 894         |
| 10    | 2530        |
| 20    | 7155        |
| 50    | 28284       |

Levels are cumulative: to reach level N, you need the sum of `XP_required(1)` through `XP_required(N-1)`.

### XP Sources (per session)

**1. Tonnage XP** — intensity-weighted volume:

```
tonnageXP = round(weightedTonnage / 100)
weightedTonnage = sum(weight * reps * intensityFactor)
intensityFactor = clamp(weight / e1RM, 0.4, 1.2)
```

For sets with reps > 12 (where e1RM is unreliable), intensityFactor defaults to 0.5. Heavy work earns more XP per unit of tonnage than light/junk volume.

**2. AMRAP Surplus XP:**

```
amrapXP = sum(min(surplus, 10) * 10)    per AMRAP set in session
surplus = actual_reps - programmed_reps
```

Only counted when surplus > 0. Capped at 10 surplus reps per set to prevent runaway sets from dominating.

**3. PR Bonus:**

```
prXP = 100    (flat, if any T1 lift hit a new e1RM high that session)
```

Checked across bench, squat, deadlift, and OHP.

**4. Streak XP:**

```
streakXP = min((streak - 1) * 5, 50)
```

Where streak is the count of consecutive sessions with acceptable gaps. Gap tolerance is program-aware:

```
expectedGap = ceil(7 / trainingDaysPerWeek)
```

For a 6-day program, expected gap = 2 days. Sessions more than `expectedGap` days apart reset the streak to 1.

**Anti-abuse:** Sessions with total tonnage < 500 kg earn 0 XP across all sources.

---

## 11. Weekly Streak

**Source:** `packages/analytics/src/streak.ts`

### ISO Week Definition

Weeks start on **Monday** (ISO 8601). The week start is computed by finding the day of week and subtracting back to Monday.

### Completion Threshold

A week counts as "complete" if sessions that week meet or exceed 80% of the program's training days:

```
threshold = ceil(trainingDaysPerWeek * 0.8)
```

Examples:
- 6 days/week program: threshold = 5 (can miss 1 day)
- 5 days/week program: threshold = 4
- 4 days/week program: threshold = 4
- 3 days/week program: threshold = 3

### Streak Counting

The streak is the number of consecutive completed weeks, walking backwards from the week before the current week. The current (in-progress) week is tracked separately and does not count toward the streak until it completes.

```
streak = number of consecutive past weeks where sessions >= threshold
```

The walk stops at the first week that fails to meet the threshold.

---

## Additional Formulas

### Relative Intensity

**Source:** `packages/analytics/src/trends.ts`

```
relativeIntensity = weight / runningBest_e1RM
```

Uses a running best (not all-time best) for each lift so that early sessions are not penalized.

### Session Stimulus Score

**Source:** `packages/analytics/src/trends.ts`

```
stimulus = sum(reps * relativeIntensity^2)    across all sets
```

Squaring relative intensity weights heavier sets disproportionately, reflecting greater hypertrophic and neurological stimulus.

### Strength Velocity

**Source:** `packages/analytics/src/trends.ts`

```
velocity = ((current_e1RM - previous_e1RM) / days_between) * 30    (kg/month)
```

Where `previous_e1RM` is the value from 28+ days ago (or earliest available if less history exists). Classification:
- velocity > 1 kg/month: gaining
- velocity < -1 kg/month: declining
- otherwise: plateau

### Plateau Detection

**Source:** `packages/analytics/src/trends.ts`

A lift is plateaued when both conditions are met:
1. 4+ weeks since last PR
2. OLS regression slope of last 28 days of e1RM data < 0.1

The slope is computed via ordinary least squares:

```
slope = sum((x_i - x_mean) * (y_i - y_mean)) / sum((x_i - x_mean)^2)
```

Where x is the data point index and y is the estimated 1RM.

### Strength Balance Ratios

**Source:** `packages/analytics/src/trends.ts`

| Ratio            | Target | Balanced Range |
|------------------|--------|----------------|
| Deadlift / Squat | 1.20   | +/- 10%        |
| Bench / Squat    | 0.70   | +/- 10%        |
| OHP / Bench      | 0.65   | +/- 10%        |

Deviation = `(actual - target) / target * 100%`. Within +/-10% is "balanced"; below is "lagging"; above is "dominant".
