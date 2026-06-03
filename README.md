# Preseason Evaluations Dashboard

A professional, modern web dashboard for visualising preseason athlete kinematic evaluation data. Built for sport science and performance staff.

![Dashboard Preview](https://via.placeholder.com/1200x600/0f0e2a/6366f1?text=Preseason+Evaluations+Dashboard)

---

## What it does

- **Upload CSV or Excel** files with athlete performance data
- **Overview** — squad snapshot: totals, top performers, flagged athletes
- **Individual Athlete Report** — metrics, percentile rankings, radar chart, and plain-language summary
- **Group Comparison** — sortable leaderboard, scatter plot, and position-group bar charts
- **Metrics Explorer** — visualise any single metric across the full squad
- **Summary Findings** — auto-generated insights written for practitioners

The 10 built-in kinematic metrics are:

| Metric | Unit | Direction |
|---|---|---|
| CMJ Height | cm | Higher is better |
| Peak Power | W/kg | Higher is better |
| Peak Velocity | m/s | Higher is better |
| Acceleration (0–10m) | m/s² | Higher is better |
| Deceleration | m/s² | Higher is better |
| Asymmetry Index | % | Lower is better |
| RSI (Reactive Strength Index) | — | Higher is better |
| Peak Force | N/kg | Higher is better |
| Contact Time | ms | Lower is better |
| Hip ROM | ° | Higher is better |

---

## Quick start

### 1. Install Node.js

Download and install Node.js (v18 or newer) from [nodejs.org](https://nodejs.org).

Verify installation:
```bash
node --version   # should print v18+ or v20+
npm --version
```

### 2. Install dependencies

Open a terminal, navigate to this folder, and run:

```bash
cd preseason-evaluations-dashboard
npm install
```

This installs all required packages (takes ~1–2 minutes on first run).

### 3. Start the development server

```bash
npm run dev
```

Then open your browser and go to: **http://localhost:3000**

The dashboard loads with demo data. You can upload your own CSV at any time using the **Upload Data** button in the top-right corner.

---

## Uploading your own data

Your CSV or Excel file must include these column headers (exact names):

```
athlete_name, position, session_date, jump_height_cm, peak_power_w_kg,
peak_velocity_ms, acceleration_ms2, deceleration_ms2, asymmetry_index,
rsi, peak_force_n_kg, contact_time_ms, hip_rom_deg
```

A ready-to-use **template CSV** is available at `public/sample-data.csv` — you can also download it directly from the upload modal in the app.

**Tips:**
- `session_date` should be in `YYYY-MM-DD` format (e.g. `2025-06-10`)
- Extra columns in your file are fine — they will be ignored
- Missing values are handled gracefully (treated as 0)
- The app supports multiple sessions in one file — use the session filter in the header

---

## Project structure

```
src/
├── app/              # Next.js App Router (layout + page)
├── components/
│   ├── layout/       # Sidebar + Header
│   ├── upload/       # File upload modal
│   ├── overview/     # Overview cards, top performers, flags
│   ├── athlete/      # Individual report, metric cards, percentile bars
│   ├── group/        # Leaderboard, scatter, group comparison
│   ├── metrics/      # Metric visualiser (bar chart + stats)
│   └── summary/      # Auto-generated insight cards + snapshot table
├── data/             # Demo athlete dataset
├── hooks/            # useAthleteData — central data & filter state
├── lib/
│   ├── data-processing.ts  # Statistics: percentiles, z-scores, group stats
│   ├── insights.ts         # Narrative generation + team insights
│   └── utils.ts            # Metric registry, formatting, colour helpers
└── types/            # TypeScript interfaces
```

---

## Building for production

```bash
npm run build
npm start
```

Or deploy to [Vercel](https://vercel.com) with zero configuration — just connect your GitHub repo.

---

## Extending the dashboard

- **Add new metrics**: add an entry to `METRIC_REGISTRY` in `src/lib/utils.ts` and include the column in your CSV
- **Change sport context**: update position labels and metric descriptions in the registry
- **Add a new section**: create a component in `src/components/` and wire it into `src/app/page.tsx`
- **Connect a database**: replace `useAthleteData` hook with a fetch call to your API

---

## Tech stack

| Tool | Purpose |
|---|---|
| Next.js 14 | Framework (App Router) |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| Recharts | Data visualisation |
| PapaParse | CSV parsing |
| xlsx | Excel parsing |
| Lucide React | Icons |

---

## Licence

MIT — free to use, modify, and distribute.
