# Gamification System

Workout includes an RPG-inspired gamification layer on top of the training log. Everything described here is computed client-side from your lift entries -- there is no server component.

---

## 1. XP System

### Sources

Every training session can earn XP from four independent sources:

| Source | How it works | Cap / notes |
|--------|-------------|-------------|
| **Tonnage XP** | Intensity-weighted tonnage divided by 100. Each set contributes `weight x reps x intensity_factor`. The intensity factor is `weight / estimated_1RM` for that set, clamped to [0.4, 1.2]. Heavy low-rep work earns more per kg than light high-rep work. | None (scales with session size) |
| **AMRAP Surplus XP** | For every `t1_amrap` set where the notes contain `programmed N+`, surplus reps beyond N each award 10 XP. | Max 10 surplus reps counted per set (100 XP cap per set) |
| **PR Bonus** | A flat 100 XP if the session contains a new estimated-1RM high on any of the four T1 lifts (bench, squat, deadlift, OHP). | 100 XP per session, regardless of how many PRs |
| **Streak XP** | `(streak_length - 1) x 5`, where streak length is the number of consecutive sessions without a gap exceeding the expected rest interval. | Capped at 50 XP per session (reached at streak of 11) |

### Anti-abuse

Sessions with total tonnage below **500 kg** earn **0 XP** across all sources. This prevents farming tiny sessions for streak or PR bonuses.

### Streak gap tolerance

The expected gap between sessions is derived from training frequency: `ceil(7 / training_days_per_week)`. Default training frequency is 6 days/week, giving an expected gap of 2 days. Any gap larger than this resets the streak to 1.

### Level curve

XP required per level: **80 x level^1.5** (rounded).

| Level | XP required | Cumulative XP |
|-------|------------|---------------|
| 1 | 80 | 80 |
| 2 | 226 | 306 |
| 3 | 416 | 722 |
| 4 | 640 | 1,362 |
| 5 | 894 | 2,256 |
| 10 | 2,530 | ~12,800 |
| 20 | 7,155 | ~63,000 |
| 50 | 28,284 | ~560,000 |

The curve is slightly front-loaded so that lifters training 3-6 times per week see meaningful early progression.

---

## 2. Ranks

Ranks are determined by your **overall strength score** (DOTS-based by default, with Wilks as a legacy option, computed from your best recent e1RM on squat, bench, deadlift, and OHP relative to bodyweight). The first rank whose `minScore` you meet or exceed is your current rank.

| Rank | Min Score | Color |
|------|-----------|-------|
| **Mythic** | 125 | Red |
| **Legend** | 112.5 | Deep Orange |
| **Warlord** | 100 | Amber |
| **Iron Champion** | 87.5 | Lime |
| **Iron Warrior** | 75 | Green |
| **Iron Adept** | 60 | Teal |
| **Apprentice** | 45 | Indigo |
| **Initiate** | 30 | Deep Purple |
| **Civilian** | 0 | Blue Grey |

Reaching each rank (except Civilian) unlocks a corresponding strength achievement.

---

## 3. Classes

Your class reflects which scoring category dominates your profile. The system computes the best lift score within each of four categories and picks the highest.

| Class | Dominant Category | Description |
|-------|------------------|-------------|
| **The Juggernaut** | Squat | Squat Dominance |
| **The Titan** | Floor Pull | Pulling Dominance |
| **The Gladiator** | Horizontal Press | Pressing Power |
| **The Olympian** | Vertical Press | Overhead Strength |
| **The Atlas** | Balanced | All category scores within 20% of each other (requires at least 3 scored categories) |
| **The Initiate** | None | No scored lifts yet |

The scoring categories (Squat, Floor Pull, Horizontal Press, Vertical Press) come from the analytics package's `SCORING_CATEGORIES` mapping, which groups related lifts together (e.g., Floor Pull includes deadlift and sumo deadlift).

---

## 4. Titles

Titles are a reputation system based purely on **total session count** (number of unique training days). The first threshold you meet or exceed determines your title.

| Title | Min Sessions |
|-------|-------------|
| **Legend of Iron** | 1,000 |
| **Master of Iron** | 500 |
| **Veteran of Steel** | 250 |
| **Iron Warrior** | 100 |
| **Iron Disciple** | 50 |
| **Barbell Initiate** | 10 |
| **Newcomer** | 1 |

---

## 5. Status

Status is a Doom-inspired face indicator that communicates your current training state at a glance. It is computed from two inputs: **readiness score** (0-100, primary signal) and **current streak** (modifier).

### Base level from readiness score

| Readiness Score | Status Level |
|----------------|-------------|
| >= 80 | **Bloodlust** -- "Blood in the water. Go lift heavy." |
| >= 60 | **Determined** -- "Locked in. Execute the plan." |
| >= 40 | **Steady** -- "Consistent. Keep grinding." |
| >= 20 | **Tired** -- "Recovery needed. Deload or rest." |
| < 20 | **Wrecked** -- "Take a break. Seriously." |

If no readiness data is available, streak is used as the primary signal instead: streak >= 10 gives Determined, streak >= 3 gives Steady, otherwise Tired.

### Streak modifier

If your current streak is **10 or more** sessions, your status is boosted by one tier (e.g., Steady becomes Determined, Tired becomes Steady). Bloodlust cannot be boosted further.

Each status level has a corresponding pixel-art face with distinct skin tone, eye color, and background glow.

---

## 6. Skills

A per-lift skill progression system (Runescape-style). Skills always advance as long as you train the lift, providing visible progress even during strength plateaus.

### Tracked lifts

Bench, Squat, Deadlift, OHP.

### Skill XP calculation

Per session, each tracked lift earns: **lift_tonnage / 50** XP (rounded).

Tonnage is the raw sum of `weight x reps` for all sets of that lift in a session.

### Skill level curve

Identical to the overall XP level curve: **80 x level^1.5** per level. Each lift has its own independent level and progress bar.

---

## 7. Achievements

Achievements are declarative checks that run against all lift entries. Each has a `check()` function that returns true/false. There are six categories:

### Categories

| Category | Color | Description |
|----------|-------|-------------|
| **Strength** | Red | 1RM milestones and rank achievements |
| **Consistency** | Green | Session counts and streaks |
| **Endurance** | Orange | Cumulative tonnage and reps |
| **Program Mastery** | Indigo | AMRAP performance, PRs, program adherence |
| **Legendary** | Gold | Elite or unusual accomplishments |
| **Secret** | Purple | Hidden until unlocked |

### Strength achievements

**Bench:**
| Achievement | Description |
|------------|-------------|
| First Flight | Bench 1RM >= 60kg |
| Double Iron | Bench 1RM >= 80kg |
| Bar Bender | Bench 1RM >= 100kg |
| Bench Barbarian | Bench 1RM >= 120kg |
| Chest of Steel | Bench 1RM >= 140kg |

**Squat:**
| Achievement | Description |
|------------|-------------|
| First Descent | Squat 1RM >= 60kg |
| Gatekeeper | Squat 1RM >= 100kg |
| Atlas Rising | Squat 1RM >= 120kg |
| Titan of Depth | Squat 1RM >= 140kg |
| Mountain Mover | Squat 1RM >= 160kg |
| Quadzilla | Squat 1RM >= 180kg |
| Barbell Throne | Squat 1RM >= 200kg |

**Deadlift:**
| Achievement | Description |
|------------|-------------|
| Breaking Gravity | Deadlift 1RM >= 60kg |
| Iron Spine | Deadlift 1RM >= 100kg |
| Earth Mover | Deadlift 1RM >= 140kg |
| Tectonic Shift | Deadlift 1RM >= 180kg |
| Planet Puller | Deadlift 1RM >= 220kg |
| Gravity Denied | Deadlift 1RM >= 260kg |

**OHP:**
| Achievement | Description |
|------------|-------------|
| Skyward | OHP 1RM >= 40kg |
| Sky Breaker | OHP 1RM >= 60kg |
| Thunderbolt | OHP 1RM >= 70kg |
| Stormcaller | OHP 1RM >= 80kg |
| Olympian | OHP >= bodyweight |
| Shoulder Forge | OHP 1RM >= 100kg |

**Totals (SBD = Squat + Bench + Deadlift):**
| Achievement | Description |
|------------|-------------|
| Iron Trinity | SBD total >= 300kg |
| Triple Crown | SBD total >= 3x bodyweight |
| The Thousand | SBD total >= 453.6kg (1000 lb) |
| The Iron Standard | SBD total >= 4x bodyweight |
| The Fifteen Hundred | SBD total >= 680kg (1500 lb) |
| Competitive Ready | SBD total >= 5x bodyweight |

**Rank achievements:** One achievement per rank (Initiate through Mythic), unlocked when you reach that rank's minimum score.

Note: Strength achievements use the best estimated 1RM across ALL set types, not just progression sets.

### Consistency achievements

| Achievement | Description |
|------------|-------------|
| Day One | Log your first session |
| Getting Serious | Log 10 sessions |
| Iron Habit | Log 50 sessions |
| Centurion | Log 100 sessions |
| Veteran | Log 250 sessions |
| Iron Lifetime | Log 500 sessions |
| On Fire | 3-day training streak |
| Unstoppable | 7-day training streak |
| Warpath | 14-day training streak |

Streak achievements use consecutive calendar days (gap of exactly 1 day).

### Endurance achievements

| Achievement | Description |
|------------|-------------|
| Volume Rookie | Lift 100 tons total (100,000 kg) |
| Volume Warrior | Lift 500 tons total |
| Iron Mountain | Lift 1,000 tons total |
| Volume Titan | Lift 5,000 tons total |
| Rep Counter | Complete 1,000 total reps |
| Rep Machine | Complete 5,000 total reps |
| Rep God | Complete 10,000 total reps |

### Program Mastery achievements

| Achievement | Description |
|------------|-------------|
| AMRAP Slayer | Beat AMRAP target by +3 on any set |
| Overachiever | Beat AMRAP target by +5 on any set |
| Rep Annihilator | Beat AMRAP target by +8 on any set |
| Volume Monster | Accumulate 50 total AMRAP surplus reps |
| Pain Train | Complete 6 sessions in one week |
| Program Devotee | Complete 6-day weeks 4 times |
| PR Hunter | Set 5 personal records |
| Record Breaker | Set 20 personal records |

### Legendary achievements

| Achievement | Description |
|------------|-------------|
| Well Rested | Log a session with 8+ hours sleep |
| Recovery Master | Average 7.5+ hours sleep across all sessions |
| Tonnage King | Hit 20+ tons (20,000 kg) in a single session |
| All Fours | Score 75+ on all 4 main lifts simultaneously |

### Secret achievements

These are hidden until unlocked (descriptions shown here for documentation):

| Achievement | Description |
|------------|-------------|
| Zombie Mode | Train on less than 5 hours of sleep |
| Iron Comeback | Return after 14+ day break |
| The Deload Prophet | Take a 7+ day break and PR within 3 sessions of return |
| Midnight Iron | Log a session (always unlocked on first session) |

---

## 8. Boss Battles

Bosses are one-time challenges with fixed targets. Defeating a boss awards bonus XP. A boss is considered defeated when your best recent estimated 1RM meets or exceeds the target.

| Boss | Challenge | Lift | Target | XP Reward |
|------|-----------|------|--------|-----------|
| **The Gatekeeper** | Squat 100kg | Squat | 100 kg | 500 |
| **The Iron Gate** | Bench 100kg | Bench | 100 kg | 500 |
| **The Earth Shaker** | Deadlift 140kg | Deadlift | 140 kg | 500 |
| **The Skybreaker** | Press your bodyweight overhead | OHP | Bodyweight | 600 |
| **The Mountain** | Squat 140kg | Squat | 140 kg | 700 |
| **The Gladiator** | Bench 140kg | Bench | 140 kg | 700 |
| **The Titan** | Deadlift 180kg | Deadlift | 180 kg | 800 |
| **The Colossus** | Deadlift 220kg | Deadlift | 220 kg | 1,000 |
| **The Leviathan** | SBD total >= 4x bodyweight | SBD Total | 4x BW | 1,200 |
| **Iron God** | SBD total >= 5x bodyweight | SBD Total | 5x BW | 2,000 |

Total possible boss XP: **8,500**.

---

## 9. Quests

Quests are short-term objectives that reset on a daily or weekly cadence. They provide recurring XP rewards for consistent execution.

### Daily quests

Evaluated against today's session (local date):

| Quest | Description | Condition | XP Reward |
|-------|-------------|-----------|-----------|
| **Iron Discipline** | Complete all T1 sets | >= 8 T1/T1-AMRAP sets in today's session | 50 |
| **Volume Crusher** | Hit 10k session tonnage | Today's session tonnage >= 10,000 kg | 80 |
| **Beyond the Limit** | Beat AMRAP by +2 reps | Any T1-AMRAP set today with surplus >= 2 | 60 |

### Weekly quests

Evaluated from Monday through the current day of the week:

| Quest | Description | Condition | XP Reward |
|-------|-------------|-----------|-----------|
| **Pain Train** | Complete all 6 nSuns days | >= 6 sessions this week | 300 |
| **Record Setter** | PR any lift this week | Any T1 lift PR date falls within this week | 400 |
| **Dedicated** | Train 4 days this week | >= 4 sessions this week | 150 |

---

## 10. Seasons

Training history is divided into **12-week seasons** starting from your first logged session. Each season tracks:

- **Session count** -- number of training days in the 12-week window
- **PR count** -- number of sessions containing a T1 lift PR
- **Total XP** -- sum of all session XP earned during the season
- **Active flag** -- whether the current date falls within this season

Seasons are sequential and non-overlapping. Season 1 begins on the date of your first ever session, Season 2 begins the day after Season 1 ends (84 days later), and so on. The last season in the list is always the one containing today's date (marked as active).

Seasons provide a built-in periodization lens: you can compare XP earned, PRs hit, and volume across 12-week training blocks without any manual configuration.
