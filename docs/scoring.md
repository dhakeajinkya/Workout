# Scoring Pipeline

IronLogs converts raw sets into a normalized 0-125+ strength score that accounts for bodyweight, age, sex, and lift type. The pipeline lives in `packages/analytics/src/scoring.ts` and `packages/analytics/src/e1rm.ts`.

## Step-by-Step Pipeline

### 1. Estimate 1RM (Wathan Formula)

From a set of weight x reps, estimate the one-rep max:

```
1RM = 100 * weight / (48.8 + 53.8 * e^(-0.075 * reps))
```

Sets with reps > 12 are excluded (endurance dominates at high reps). Single-rep sets return the weight directly.

### 2. Project to Estimated Powerlifting Total

Each lift has a known ratio representing what fraction of a full powerlifting total it typically accounts for. The estimated total is:

```
estimatedTotal = 1RM / liftRatio
```

For example, if deadlift ratio is 0.3968 and your deadlift 1RM is 200kg, your estimated total is 200 / 0.3968 = 504kg.

### 3. Bodyweight Normalization (DOTS or Wilks)

The estimated total is multiplied by a bodyweight-dependent coefficient to normalize across weight classes:

```
points = estimatedTotal * coefficient(bodyweight, sex)
```

Both DOTS and Wilks use the form `500 / polynomial(bw)` but with different polynomial degrees and coefficients. Bodyweight is clamped to the valid range of 40-210kg.

**DOTS** (default, 4th-degree polynomial): Official IPF formula adopted 2019.

**Wilks** (legacy, 5th-degree polynomial): Older formula, still widely used.

### 4. Age Adjustment

A multiplier compensates for age-related strength differences:

- **Under 23**: `0.0039 * age^2 - 0.167 * age + 2.80` (bonus for juniors)
- **23-40**: `1.0` (no adjustment)
- **Over 40**: `0.000468 * age^2 - 0.0300 * age + 1.45` (bonus for masters)

### 5. Formula Scaling

Raw points are divided by a formula-specific divisor to map onto the 0-125 level scale:

```
score = (points * ageAdjustment) / divisor
```

- DOTS divisor: **4.3**
- Wilks divisor: **4.0**

### 6. Level Classification

The final score maps to a strength level (see thresholds below).

## Sex-Specific Lift Ratios

Each ratio represents the lift's expected proportion of a full powerlifting total.

| Lift | Male | Female |
|------|------|--------|
| deadlift | 0.3968 | 0.3750 |
| squat | 0.3452 | 0.3500 |
| bench | 0.2579 | 0.2800 |
| sumo_deadlift | 0.3968 | 0.3750 |
| front_squat | 0.2762 | 0.2800 |
| incline_bench | 0.2115 | 0.2300 |
| ohp | 0.1676 | 0.1800 |
| push_press | 0.2229 | 0.2400 |
| snatch_press | 0.1341 | 0.1450 |
| pendlay_row | 0.2103 | 0.2200 |
| power_clean | 0.2222 | 0.2350 |
| cgbench | 0.2321 | 0.2520 |

Female ratios are shifted: bench and squat account for a larger share of total, deadlift for a smaller share, reflecting sex-specific strength distribution patterns.

## Five Scoring Categories

Individual lift scores are grouped into five categories to ensure the overall score reflects balanced strength:

| Category | Lifts |
|----------|-------|
| Squat | squat, front_squat |
| Floor Pull | deadlift, sumo_deadlift, power_clean |
| Horizontal Press | bench, incline_bench |
| Vertical Press | ohp, push_press, snatch_press |
| Pull/Row | chinup, pullup, pendlay_row |

**Aggregation**: The best score within each category is selected, then the overall score is the average across all categories that have at least one scored lift. This prevents a single strong lift from inflating the overall score and rewards well-rounded strength.

## Level Thresholds and Colors

| Min Score | Level | Color |
|-----------|-------|-------|
| 125 | World Class | `#f44336` (red) |
| 112.5 | Elite | `#ff5722` (deep orange) |
| 100 | Exceptional | `#ffc107` (amber) |
| 87.5 | Advanced | `#cddc39` (lime) |
| 75 | Proficient | `#4caf50` (green) |
| 60 | Intermediate | `#009688` (teal) |
| 45 | Novice | `#3f51b5` (indigo) |
| 30 | Untrained | `#673ab7` (deep purple) |
| 0 | Subpar | `#e91e63` (pink) |

## Formula Scaling Calibration

Both DOTS and Wilks must produce equivalent level classifications for the same lifter. The system is calibrated at a reference bodyweight of **83kg male**.

At 83kg, the DOTS coefficient and Wilks coefficient differ. The divisors (DOTS=4.3, Wilks=4.0) are chosen so that:

```
dotsCoeff(83) / 4.3 ≈ wilksCoeff(83) / 4.0
```

This means a lifter scored with DOTS and the same lifter scored with Wilks will land in the same level bracket. The 83kg reference was chosen as a common competitive weight class near the median of competitive male powerlifters.

## How DOTS and Wilks Relate

Both formulas solve the same problem (normalizing strength across bodyweights) using the same general form: `500 / polynomial(bw)`. They differ in:

- **Polynomial degree**: DOTS uses 4th degree, Wilks uses 5th degree
- **Coefficient sets**: Completely different values, separately fitted to competition data
- **Era**: Wilks dates to the 1990s; DOTS was adopted by the IPF in 2019 as a more accurate model at extreme bodyweights
- **In this system**: Both produce the same level classifications due to the per-formula scaling divisors. DOTS is the default.
