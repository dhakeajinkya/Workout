# Architecture

## Philosophy

Workout is a personal strength tracking PWA built on these principles:

1. **User-first** — Every feature serves the lifter's daily workflow
2. **Data-local** — No server, no database, no accounts. CSV + git = version control
3. **No paywall** — Fully open source, zero hosting costs (GitHub Pages)
4. **PWA-first** — Mobile-friendly, installable, works offline for cached assets
5. **Program-agnostic** — Core analytics work with any program; only the program JSON is nSuns-specific

## Monorepo Structure

```
Workout/
  apps/
    demo/                 # Demo app
    web/                  # React 19 + Vite frontend (the PWA)
  packages/
    core/                 # Domain types (LiftEntry, DaySession, StrengthLevel)
    csv-parser/           # CSV import/export, normalization, multi-format support
    analytics/            # All math: e1RM, scoring, fatigue, trends, muscles, PRs
    gamification/         # XP, levels, ranks, classes, titles, achievements, quests, bosses, seasons
    charts/               # Shared chart configurations (Chart.js wrappers)
    insights/             # Training insight generators
    plugin-api/           # Plugin type definitions (aspirational — not yet functional)
    ui/                   # Shared UI components (minimal currently)
  cli/                    # CLI stub (not yet functional)
  examples/               # Sample CSV datasets
  docs/                   # This documentation
  public/
    data/
      lifts.csv           # The user's training log (the single source of truth)
      nsuns-program.json  # Program configuration with calculated weights
```

## Data Flow

```
lifts.csv (static file in public/)
    │
    ▼
PapaParse (CSV → LiftEntry[])
    │
    ▼
LiftsContext (React Context — shared across all pages)
    │
    ├──► useLifts() hook — exposes entries, loading state, refresh
    │
    ├──► groupByDay() — aggregates into DaySession[] with tonnage
    │
    ├──► Analytics pipeline:
    │      estimate1RM() → calcLiftScore() → calcOverallScore()
    │      calcFatigue() / calcLiftFatigue() → ACWR
    │      calcReadiness() → composite score
    │      getSessionIntensities() → relative intensity tracking
    │      detectPlateaus() → stagnation detection
    │
    ├──► Gamification pipeline:
    │      calcXPProfile() → levels, XP breakdown
    │      calcSkillProfile() → per-lift skill levels
    │      getRank() / getLifterClass() / getTitle() → character identity
    │      checkAchievements() → unlocked achievements
    │      getBosses() / getDailyQuests() / getWeeklyQuests()
    │
    └──► IndexedDB (via idb library):
           - Locally logged sets (before CSV merge)
           - Unlocked achievement state
           - User settings
```

## IndexedDB Stores

| Store | Purpose | Syncs to CSV? |
|-------|---------|---------------|
| `lifts` | Sets logged via the Log page before export | Yes — user exports CSV and commits |
| `achievements` | Achievement unlock timestamps | No — recalculated from entries |
| `settings` | User preferences | No |

## Routing

React Router with lazy-loaded pages. All routes defined in `App.tsx`:

| Route | Page | Priority |
|-------|------|----------|
| `/` | Dashboard | Primary — daily status overview |
| `/log` | Log | Primary — workout logging |
| `/scores` | Scores | Core — per-lift strength scores |
| `/progression` | Progression | Core — 1RM trend charts |
| `/journal` | Journal | Reference — session history |
| `/analytics` | Analytics | Deep — 12 analytics cards |
| `/bodyweight` | Bodyweight | Tracking — BW trend chart |
| `/tonnage` | Tonnage | Tracking — volume over time |
| `/frequency` | Frequency | Tracking — training frequency heatmap |
| `/compliance` | Compliance | Tracking — program adherence |
| `/overall` | Overall | Deep — composite score over time |
| `/muscle-map` | MuscleMap | Visual — muscle group scores on SVG body |
| `/amrap` | Amrap | Deep — AMRAP surplus trends |
| `/character` | Achievements | Gamification — full character sheet |
| `/goals` | Goals | Planning — strength targets |

## Deployment

GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`):
- Push to `main` → auto-deploy
- Base path: `/Workout/`
- SPA redirect hack in `index.html` for client-side routing on GH Pages

## PWA Configuration

- `vite-plugin-pwa` with `registerType: 'autoUpdate'`
- Workbox caches: JS, CSS, HTML, PNG, JSON, CSV
- Manifest: standalone display, dark theme (#1b1b1d)

### Known PWA Issues

- **CSV caching**: Workbox caches `*.csv` files. After updating lifts.csv and pushing, the service worker must update before users see new data. This creates a brief staleness window.
- **No offline data strategy**: LiftsContext now catches CSV fetch errors gracefully and falls back to empty arrays instead of showing infinite "Loading...". However, IndexedDB data is available offline while historical CSV data may still be stale or unavailable until the service worker cache updates.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| CSV over database | Git versioning, human-readable, portable, no hosting costs |
| Wathan over Epley for 1RM | Most accurate across 1-10 rep range (NSCA research) |
| DOTS over Wilks for scoring | IPF standard since 2019, better across weight classes |
| EWMA over rolling average for ACWR | Reduces noise, weights recent data more heavily |
| 12-rep cap for 1RM estimation | Endurance becomes limiting factor above 12 reps |
| Cubic weighting for muscle scores | Heavily involved muscles dominate the score (anatomically correct) |
| 80 × level^1.5 XP curve | Slightly faster early progression for 3-6x/week training |
| Monday-based ISO weeks for streaks | Standard in most training programs |
| `useMemo` for Dashboard computations | Dashboard derives scores, fatigue, readiness, and session data — all memoized to avoid recomputation on re-render |
| Pagination in Journal and Progression | Limits DOM size and computation cost for pages that render many sessions or chart points |
