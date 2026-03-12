# Contributing

## Getting Started

1. **Fork** this repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/ironlogs.git
   cd ironlogs
   ```
3. **Install dependencies** (requires [pnpm](https://pnpm.io/) v9+):
   ```bash
   pnpm install
   ```
4. **Start the dev server**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173/ironlogs/`.

## Personal Configuration

Edit `apps/web/src/config.ts` with your details:

```ts
export const USER_CONFIG = {
  name: 'Your Name',
  age: 25,
  sex: 'male' as const,   // 'male' | 'female'
  units: 'kg' as const,    // 'kg' | 'lb'
  targetBodyweight: 80,
};
```

Scoring uses your sex and bodyweight for DOTS/Wilks calculations, so these values matter.

## Loading Your Data

Replace `apps/web/public/data/lifts.csv` with your training log. The CSV must have this header:

```
date,bodyweight,lift,weight,reps,set_type,notes,sleep
```

| Column | Required | Description |
|--------|----------|-------------|
| `date` | Yes | `YYYY-MM-DD` format |
| `bodyweight` | No | Your bodyweight that day (kg or lb, matching your config) |
| `lift` | Yes | Lift name (e.g. `bench`, `squat`, `deadlift`, `ohp`). Common variations are auto-normalized. |
| `weight` | Yes | Weight lifted |
| `reps` | Yes | Number of reps |
| `set_type` | No | `t1_amrap`, `testing`, `t1`, `t2`, `accessory`, etc. |
| `notes` | No | Free text. For AMRAP sets, use `programmed N+` (e.g. `programmed 1+`) to enable surplus tracking. |
| `sleep` | No | Hours of sleep the night before |

A minimal CSV with just `date,lift,weight,reps` also works. See `examples/` for sample datasets:
- `minimal_log.csv` -- four columns only
- `extended_log.csv` -- all columns
- `year_of_training.csv` -- a full year of data

## Building

```bash
npm run build    # Type-check (tsc -b) then Vite production build
npm run lint     # ESLint
npm run preview  # Preview the production build locally
```

For the full monorepo (all packages):

```bash
npm run build:all   # Build every package via Turbo
npm run typecheck   # Type-check every package
```

## Deploying

IronLogs deploys to **GitHub Pages** via a GitHub Actions workflow (`.github/workflows/deploy.yml`).

**How it works:**
1. Push to `main` triggers the workflow (or run it manually via `workflow_dispatch`).
2. The action installs pnpm, runs `pnpm --filter @ironlogs/web build`, and uploads `apps/web/dist` as a Pages artifact.
3. GitHub deploys the artifact to your Pages site.

**Setup for your fork:**
1. Go to your repo's **Settings > Pages**.
2. Set the source to **GitHub Actions**.
3. The base path is `/ironlogs/` (configured in `vite.config.ts`). If your repo has a different name, update the `base` option accordingly.
4. Push to `main` and the action will deploy automatically.

Client-side routing works on GitHub Pages via an SPA redirect hack in `index.html`.

## Project Structure

This is a pnpm monorepo managed with Turborepo:

```
apps/
  web/                  # React 19 + Vite PWA (the main app)
packages/
  core/                 # Shared domain types (LiftEntry, DaySession, StrengthLevel)
  csv-parser/           # CSV import, export, normalization, multi-format support
  analytics/            # All math: e1RM, scoring, fatigue, trends, muscles, PRs
  gamification/         # XP, levels, ranks, classes, titles, achievements, quests
  charts/               # Shared Chart.js wrapper configurations
  insights/             # Training insight generators
  plugin-api/           # Plugin type definitions (aspirational, not yet functional)
  ui/                   # Shared UI components (minimal)
cli/                    # CLI stub (not yet functional)
examples/               # Sample CSV datasets
docs/                   # Documentation
```

## Adding a New Lift

Three files need changes:

### 1. Lift ratio in `packages/analytics/src/scoring.ts`

Add an entry to `LIFT_RATIOS_BY_SEX` for both `male` and `female`. The ratio represents what fraction of a powerlifting total this lift corresponds to. For example, OHP is roughly 16.8% of a male total:

```ts
const LIFT_RATIOS_BY_SEX = {
  male: {
    // ...existing lifts...
    your_lift: 0.1234,
  },
  female: {
    // ...existing lifts...
    your_lift: 0.1300,
  },
};
```

### 2. Muscle involvement in `packages/analytics/src/muscles.ts`

Add a row to the `LIFT_INVOLVEMENT` map. Each muscle gets a 0-10 involvement score (0 = not used, 10 = primary mover):

```ts
const LIFT_INVOLVEMENT: Record<string, Record<MuscleKey, number>> = {
  // ...existing lifts...
  your_lift: { upperTraps:0, middleTraps:0, /* ...all 22 muscles... */ calves:0 },
};
```

### 3. Name normalization in `packages/csv-parser/src/normalize.ts`

If users might type the lift name differently (e.g. "close grip bench" vs "cgbench"), add aliases. The normalizer checks `CANONICAL_LIFTS` and `LIFT_ALIASES` from `@ironlogs/core`, so add the canonical name there and any aliases you want to support.

## Adding an Achievement

Add a new entry to the `ACHIEVEMENTS` array in `packages/gamification/src/achievements.ts`:

```ts
export const ACHIEVEMENTS: Achievement[] = [
  // ...existing achievements...
  {
    id: 'unique_snake_case_id',
    title: 'Display Title',
    description: 'Human-readable condition (e.g. "Squat 1RM >= 100kg")',
    category: 'strength',  // 'strength' | 'consistency' | 'endurance' | 'program' | 'legendary' | 'secret'
    secret: false,          // optional, hides description until unlocked
    check: (entries) => best1RM(entries, 'squat') >= 100,
  },
];
```

The `check` function receives all `LiftEntry[]` and returns `true` when the achievement is earned. Helper functions like `best1RM()`, `sessionCount()`, `totalTonnage()`, and `totalReps()` are available in the same file.

## Testing

Vitest is configured at the monorepo root:

```bash
npm test          # Watch mode
npm run test:run  # Single run
```

Test files live alongside source code in `__tests__/` directories (e.g. `packages/analytics/src/__tests__/`). Coverage is not yet comprehensive -- contributions welcome.
