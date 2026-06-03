// ─── Core Data Types ─────────────────────────────────────────────────────────

export type Position = "Forward" | "Midfielder" | "Defender" | "Goalkeeper" | string;

export interface AthleteRaw {
  athlete_name: string;
  position: Position;
  session_date: string;  // ISO date string YYYY-MM-DD
  // The 10 kinematic metrics
  jump_height_cm: number;       // CMJ height — higher is better
  peak_power_w_kg: number;      // Relative peak power — higher is better
  peak_velocity_ms: number;     // Max sprint velocity — higher is better
  acceleration_ms2: number;     // 0-10 m acceleration — higher is better
  deceleration_ms2: number;     // Braking deceleration (abs value) — higher is better
  asymmetry_index: number;      // Left-right asymmetry % — lower is better
  rsi: number;                  // Reactive Strength Index — higher is better
  peak_force_n_kg: number;      // Relative peak GRF — higher is better
  contact_time_ms: number;      // Ground contact time — lower is better
  hip_rom_deg: number;          // Hip flexion ROM degrees — higher is better
  [key: string]: string | number; // Allow extra numeric columns from uploads
}

// ─── Processed Athlete with derived stats ────────────────────────────────────

export interface AthleteProcessed extends AthleteRaw {
  id: string; // derived from name + date
  percentiles: Record<string, number>;      // 0–100 per metric
  zScores: Record<string, number>;          // z-scores per metric
  strengths: string[];                      // metric keys in top tercile
  weaknesses: string[];                     // metric keys in bottom tercile
  overallScore: number;                     // composite 0–100
  flags: string[];                          // auto-generated flag messages
}

// ─── Metric Metadata ──────────────────────────────────────────────────────────

export interface MetricMeta {
  key: string;
  label: string;
  unit: string;
  higherIsBetter: boolean;
  description: string;
  category: "Power" | "Speed" | "Strength" | "Asymmetry" | "Mobility";
  color: string; // tailwind color token for charts
}

// ─── Group/Team summary ───────────────────────────────────────────────────────

export interface GroupStats {
  mean: Record<string, number>;
  median: Record<string, number>;
  std: Record<string, number>;
  min: Record<string, number>;
  max: Record<string, number>;
  p25: Record<string, number>;
  p75: Record<string, number>;
}

export interface PositionGroupStats {
  [position: string]: GroupStats;
}

// ─── Dashboard state ──────────────────────────────────────────────────────────

export type NavSection = "overview" | "athlete" | "group" | "metrics" | "summary";

export interface Filters {
  selectedAthlete: string | null;
  selectedPosition: string | null;
  selectedSession: string | null;
  selectedMetric: string | null;
}
